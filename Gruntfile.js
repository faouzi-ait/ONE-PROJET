/*
 * This file watches theme folder for running client in development.
 * Changes to any theme files will cause copy-theme.js to run. Which in turn causes webpack to re-build
 *
 * CAUTION:
 *   I found updating files is flawless, however sometimes when creating a new file in nested sub-directories
 *   the watch does not register the creation and never fires copy-theme
 */

const path = require('path')

module.exports = function(grunt) {
  const clientName = grunt.option('CLIENT')
  const themeFolderPath = path.join(
    __dirname,
    '/src/theme/',
    clientName,
    '/**/*.*',
  )
  const modelFolderPath = path.join(
    __dirname,
    '/src/javascript/models/schema',
    '/*.*',
  )
  const defaultSassFolderPath = path.join(
    __dirname,
    '/src/stylesheets/default/**/*.*'
  )

  grunt.initConfig({
    watch: {
      'theme-folders': {
        files: [themeFolderPath],
        tasks: ['run:copy-theme'],
        options: {
          spawn: false,
        },
      },
      'model-folders': {
        files: [modelFolderPath],
        tasks: ['run:build-models'],
        options: {
          spawn: false,
        },
      },
      'default-sass': {
        files: [defaultSassFolderPath],
        tasks: ['run:copy-theme'],
        options: {
          spawn: false,
        },
      }
    },
    run: {
      'copy-theme': {
        // cmd: 'node', // Node is default command, no need for it being specified
        args: ['copy-theme.js', clientName],
      },
      'build-models': {
        cmd: 'npm',
        args: ['run', 'build-models'],
      },
    },
  })

  // Load plugin for grunt watch
  grunt.loadNpmTasks('grunt-contrib-watch')

  // Load plugin for grunt run
  grunt.loadNpmTasks('grunt-run')

  // Default task(s).
  grunt.registerTask('default', ['watch:theme-folders', 'watch:model-folders', 'watch:default-sass'])
}
