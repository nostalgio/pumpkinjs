/* jshint node: true */
'use strict';

let babel = require('rollup-plugin-babel');

module.exports = function(grunt) {
    grunt.initConfig({
        clean: {
            build: 'dist/*'
        },
        jshint: {
            options: {
                esversion: 6
            },
            all: {
                src: [
                    'Gruntfile.js',
                    'src/*.js'
                ]
            }
        },
        rollup: {
            build: {
                options: {
                    format: 'es',
                    sourceMap: true,
                    plugins: function() {
                        return [
                            babel({compact: false})
                        ];
                    }
                },
                files: [{
                    src: 'src/build.js',  // May only contain 1 src.
                    dest: 'dist/pumpkin.js',
                }]
            }
            
        },
        uglify: {
            build: {
                files: {
                    'dist/pumpkin.min.js': 'dist/pumpkin.js'
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-rollup');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', 'Transpile ES6.', ['jshint:all', 'clean:build',
            'rollup:build', 'uglify:build']);
};