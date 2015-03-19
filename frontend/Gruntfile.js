/* jshint node: true */
'use strict';
module.exports = function(grunt) {
    grunt.initConfig({
        'clean': {
            build: './build/*'
        },

        'copy': {
            html: {
                src: 'prod.html',
                dest: 'build/index.html'
            },
            icons: {
                expand: true,
                src: 'icons/**',
                dest: 'build/'
            },
            images: {
                expand: true,
                src: 'images/**',
                dest: 'build'
            },
            deps: {
                files: [{
                    src: 'jspm_packages/babel-polyfill.js',
                    dest: 'build/polyfill.js'
                }]
            }
        },

        // browser sync
        'browserSync': {
            dev: {
                bsFiles: {
                    src: [
                        'build/app.css',
                        'src/**/*.html',
                        'src/**/*.js'
                    ]
                },
                options: {
                    watchTask: true,
                    open: false,
                    proxy: 'localhost'
                }
            }
        },

        'watch': {
            less: {
                files: ['src/**/*.less'],
                tasks: ['less:watch'],
                options: {
                    interrupt: true,
                    spawn: true
                }
            }
        },

        'exec': {
            bundle: {
                cmd: 'jspm bundle-sfx src/app build/app.js --minify --skip-source-maps'
            }
        },

        'less': {
            watch: {
                files: {
                    'build/app.css': 'src/app.less'
                }
            },
            build: {
                files: {
                    'build/app.css': 'src/app.less'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-browser-sync');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('build', [
        'clean:build',
        'copy',
        'less:build',
        'exec:bundle'
    ]);

    grunt.registerTask('watchsync', [
        'browserSync:dev',
        'watch:less'
    ]);
};
