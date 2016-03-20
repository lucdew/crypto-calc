'use strict';

const packagejson = require('./package.json'),
    bowerFiles = require('bower-files'),
    fs = require('fs');

module.exports = function(grunt) {

    // show elapsed time at the end
    require('time-grunt')(grunt);


    const beta = grunt.option('beta') || false;
    const alpha = grunt.option('alpha') || false;

    let BASENAME = 'crypto-calc';
    let APPNAME = 'CryptoCalc';

    if (alpha) {
        APPNAME += ' (Alpha)';
    } else if (beta) {
        APPNAME += ' (Beta)';
    }


    grunt.task.registerTask('addBowerFilesToCopy', 'Copy bower tasks', function() {
        // Dynamically adding bower deps to copy
        // Done dynamically because it requires bower install to be performed before

        let originalCopy = grunt.config('copy');
        let additionalFiles = {
            expand: true,
            src: bowerFiles().relative(__dirname).files,
            dest: 'build/'
        };
        let allBowerFiles = [];

        additionalFiles.src.forEach(function(element) {

            allBowerFiles.push(element);
            if (element.length < 4) {
                return;
            }
            let minifiedFile = element.substring(0, element.length - 3) + '.min.js';
            if (fs.existsSync(minifiedFile)) {
                allBowerFiles.push(minifiedFile);
            }
        }, this);

        additionalFiles.src = allBowerFiles;
        grunt.log.writeln("Adding to copy:base the following files\n " + JSON.stringify(additionalFiles));
        originalCopy.base.files.push(additionalFiles);
        grunt.config('copy', originalCopy);

    });


    grunt.initConfig({

        bower: {
            install: {
                options: {
                    targetDir: 'bower_components',
                    copy: false
                }
            }
        },

        ts: {
            options: {
                sourceMap: true,
                comments: false,
                target: 'es5',
                declaration: false,
                fast: 'never'
            },
            components: {
                src: ['components/**/*.ts'],
                options: {
                    sourceMap: true,
                    comments: false,
                    target: 'es5',
                    declaration: false,
                    fast: 'never'
                }
            },
            ui: {
                src: ['js/cryptoCalcModule.ts', 'js/cryptoCalcCommon.ts'],
                dest: 'js/cryptoCalc.js'
            },
            test: {
                src: ['test/crypto-lib/cryptolib-test.ts',
                    'test/asymmetric/asymmetric-tests.ts'
                ]
            },
            cryptolib: {
                src: ['crypto-lib/cryptolib-nodejs.ts'],
                 options: {
                    module: 'commonjs'
                }

            }
        },
        browserify: {
            dist: {
                files: {
                    'crypto-lib/cryptolib-web.js': ['crypto-lib/cryptolib-nodejs.js'],
                },
                options: {
                    exclude: ['crypto', 'node-forge', 'crypto-js'],
                    browserifyOptions: {
                        standalone: 'webcryptolib'
                    }

                }
            }

        },

        wiredep: {
            app: {
                src: ['index.html', 'index-web.html'],
                exclude: [
                    /jquery\./,
                    /spin/,
                    /forge/,
                    /angular-mocks/,
                    /crypto-js/,
                    /jsrsasign/
                ]
            }
        },
        clean: {
            release: ['build/', 'dist/', 'installer/']
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    quiet: false, // Optionally suppress output to standard out (defaults to false)
                    clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
                },
                src: ['test/crypto-lib/cryptolib-test.js']
            }
        },
        copy: {
            base: {
                files: [{
                        expand: true,
                        cwd: '.',
                        src: ['package.json', 'styles/**/*', 'js/**/*', 'images/**/*', 'crypto-lib/**/*'],
                        dest: 'build/'
                    },
                    {
                        expand: true,
                        src: ['bower_components/forge/js/**',
                              'bower_components/crypto-js/*.js',
                              'bower_components/lodash/lodash.js', // lodash (bowerFiles module does not detect it, adding it manually)
                              'bower_components/jquery-ui/themes/**'
                            ],
                        dest: 'build/'
                    }
                ]
            },
            components: {
                files: [{
                    expand: true,
                    cwd: '.',
                    src: ['components/**/*'],
                    dest: 'build/',

                }],

                options: {
                    process: function(content, srcpath) {
                        return content.replace(/VERSION/g, packagejson.version)
                            .replace(/AUTHOR/g, packagejson.author.name)
                            .replace(/REPO/g, packagejson.author.url)
                            .replace(/DATE/g, (new Date()).toString());
                    }
                }
            },
            webhome: {
                src: 'index-web.html',
                dest: 'build/index.html'
            },
            websitemap: {
                src: 'sitemap.xml',
                dest: 'build/',
                options: {
                    process: function(content, srcpath) {
                        var isoNow = new Date().toISOString();
                        return content.replace(/<lastmod>[^<]+<\/lastmod>/g, '<lastmod>' + isoNow + '</lastmode>');
                    }
                }
            },

            electron: {
                files: [{
                    expand: true,
                    cwd: '.',
                    src: ['index.html', 'index.js'],
                    dest: 'build/'

                }, {
                    cwd: 'node_modules/',
                    src: Object.keys(packagejson.dependencies).map(function(dep) {
                        return dep + '/**/*';
                    }),
                    dest: 'build/node_modules/',
                    expand: true
                }]
            }


        },
        electron: {
            windows: {
                options: {
                    name: BASENAME,
                    dir: 'build/',
                    out: 'dist/',
                    version: packagejson['electron-version'],
                    platform: 'win32',
                    arch: 'x64',
                    asar: true
                }
            },
            osx: {
                options: {
                    name: APPNAME,
                    dir: 'build/',
                    out: './dist/osx/' + APPNAME + '.app',
                    version: packagejson['electron-version'],
                    platform: 'darwin',
                    arch: 'x64',
                    asar: true,
                    'app-version': packagejson.version
                }
            }
        },

        // Need to buy a code signing certificate
        // prompt: {
        //       'create-windows-installer': {
        //         options: {
        //           questions: [
        //             {
        //               config: 'certificatePassword',
        //               type: 'password',
        //               message: 'Certificate Password: '
        //             }
        //           ]
        //         }
        //       }
        //     },
        'create-windows-installer': {
            appDirectory: 'dist/' + BASENAME + '-win32/',
            authors: 'Docker Inc.',
            //loadingGif: 'images/loading.gif',
            setupIcon: 'images/lock_2x.ico',
            //iconUrl: 'https://raw.githubusercontent.com/lucdew/crypto-calc/master/images/crypto-calc.ico',
            description: APPNAME,
            title: APPNAME,
            exe: BASENAME + '.exe',
            version: packagejson.version
                //,signWithParams: '/f ' + certificateFile + ' /p <%= certificatePassword %> /tr http://timestamp.comodoca.com/rfc3161'
        },
        compress: {
            main: {
                options: {
                    archive: 'dist/cryptocalc-web.zip'
                },
                files: [{
                    expand: true,
                    cwd: 'build',
                    src: ['**/*']
                }]
            }
        },
        nodemon: {
            dev: {
                script: 'server.js',
                options: {
                    args: ['dev'],
                    ext: 'js,html',
                    watch: ['index-web.html', 'components', 'js', 'cryptolib'],
                    delay: 1000,
                    legacyWatch: true,
                    env: {
                        PORT: 3000
                    },
                    cwd: __dirname
                }
            }
        },

    });

    require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks


    //Load NPM tasks
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-electron-installer');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-nodemon');

    //Making grunt default to force in order not to break the project.
    grunt.option('force', true);

    //Default task(s).

    grunt.registerTask('test', ['ts:cryptolib', 'ts:test', 'mochaTest', 'browserify']);

    grunt.registerTask('buildui', ['ts:ui', 'ts:components', 'browserify']);

    grunt.registerTask('testui', ['nodemon:dev']);

    grunt.registerTask('buildelectron', [
        'clean',
        'bower',
        'wiredep:app',
        'ts',
        'mochaTest',
        'addBowerFilesToCopy',
        'copy:base',
        'copy:components',
        'copy:electron',
        'electron',
        'create-windows-installer'
    ]);

    grunt.registerTask('buildweb', [
        'clean',
        'bower',
        'wiredep:app',
        'ts',
        'mochaTest',
        'browserify',
        'addBowerFilesToCopy',
        'copy:base',
        'copy:components',
        'copy:webhome',
        'copy:websitemap',
        'compress'
    ]);

    grunt.registerTask('default', ['buildweb']);


};