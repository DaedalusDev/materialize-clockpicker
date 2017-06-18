module.exports = function(grunt) {
    var aSrcFiles = [
        'src/js/**/*.js'
    ];
    var aSpecFiles = [
        'tests/specs/**/*Spec.js'
    ];
    var aSassFiles = [
        'src/sass/clockpicker.scss',
        'src/sass/components/**/*.scss',
    ];
    grunt.initConfig({
        //  Sass
        sass: {                              // Task
            expanded: {                            // Target
                options: {                       // Target options
                    outputStyle: 'expanded',
                    sourcemap: false
                },
                files: {
                    'dist/css/materialize.clockpicker.css': 'src/css/clockpicker.scss',
                }
            },
            min: {
                options: {
                    outputStyle: 'compressed',
                    sourcemap: false
                },
                files: {
                    'dist/css/materialize.clockpicker.min.css': 'src/css/clockpicker.scss',
                }
            }
        },
        //  Copy
        copy: {
            fixture: {
                src: 'index.html', dest: './tests/fixtures/fixture.html'
            }
        },
        replace: {
            fixture: {
                src: './tests/fixtures/fixture.html',
                overwrite: true,
                replacements: [
                    {
                        from: /<!DOCTYPE html>[\s\S]*<\/head>/gi,
                        to: ''
                    },
                    {
                        from: /<script[\s\S]*script>/gi,
                        to: ''
                    },
                    {
                        from: '</html>',
                        to: ''
                    },
                    {
                        from: /^(?=\n)$|^\s*|\s*$|\n\n+/gm,
                        to: ''
                    }
                ]
            }
        },
        //  Concat
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                // the files to concatenate
                src: aSrcFiles,
                // the location of the resulting JS file
                dest: 'src/js/bar.js'
            }
        },
        //  Uglify
        uglify: {
            options: {
                // Use these options when debugging
                // mangle: false,
                // compress: false,
                // beautify: true
            },
            dist: {
                files: {
                    'dist/js/materialize.clockpicker.min.js': ['dist/js/materialize.clockpicker.js']
                }
            }
        },
        //  Jasmine
        jasmine: {
            components: {
                src: aSrcFiles,
                options: {
                    vendor: [
                        'node_modules/jquery/dist/jquery.js',
                        'node_modules/jasmine-jquery/lib/jasmine-jquery.js',
                        'node_modules/materialize-css/dist/js/materialize.min.js'
                    ],
                    styles: [
                        'node_modules/materialize-css/dist/css/materialize.min.css',
                        'dist/css/materialize.clockpicker.css'
                    ],
                    specs: aSpecFiles,
                    keepRunner : true
                    //helpers: 'test/spec/*.js'
                }
            }
        },
        //  Watch Files
        watch: {
            js: {
                files: ["src/js/**/*.js"],
                tasks: ['dev'],
                options: {
                    interrupt: false,
                    spawn: false
                }
            },
            sass: {
                files: aSassFiles,
                tasks: ['sass'],
                options: {
                    interrupt: false,
                    spawn: false
                }
            },
            tests: {
                files: aSpecFiles,
                tasks: ['tests'],
                options: {
                    interrupt: false,
                    spawn: false
                }
            }
        },
        //  Concurrent
        concurrent: {
            options: {
                logConcurrentOutput: true,
                limit: 10
            },
            monitor: {
                tasks: ["watch:sass", "watch:js", "watch:tests"]
            }
        }
    });

    // load the tasks
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    // define the tasks
    grunt.registerTask('monitor', ["concurrent:monitor"]);
    grunt.registerTask('release', [
        "concat:dist",
        "uglify:dist"
    ]);
    grunt.registerTask('dev', [
        // "concat:js",
        "tests"
    ]);
    grunt.registerTask('tests', [
        "copy:fixture",
        "replace:fixture",
        "jasmine"
    ]);
};