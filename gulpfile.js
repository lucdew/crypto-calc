'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const webpack = require('webpack');
const clean = require('gulp-clean');
const webpackAppCfg = require('./webpack.config');
const webpackTestCfg = require('./test/it/webpack.config');
const rename = require('gulp-rename');
const runSequence = require('run-sequence'); // will be useless with gulp 4
const merge = require('merge-stream');
const replace = require('gulp-replace');
const packagejson = require('./package.json');
const mochaPhantomJS = require('gulp-mocha-phantomjs');
const zip = require('gulp-zip');
const cp = require('child_process');
const path = require('path');
// const mocha = require('gulp-mocha');


gulp.task('clean', () => {
  return gulp.src(['build', 'dist'], {
    read: false
  }).pipe(clean());
});

gulp.task('webpack:test', (cb) => {
  webpack(webpackTestCfg, (err, stats) => {
    if (err) throw new gutil.PluginError('webpack', err);
    gutil.log('[webpack]', stats.toString({
      // output options
    }));
    cb();
  });
});

gulp.task('webpack:app', [], function(cb) {
  webpack(webpackAppCfg, (err, stats) => {
    console.log('done webpack');
    if (err) throw new gutil.PluginError('webpack', err);
    gutil.log('[webpack]', stats.toString({
      // output options
    }));
    cb();
  });
});


gulp.task('dist', () => {
  let homeCopy = gulp.src('index-web.html')
    .pipe(rename('index.html'))
    .pipe(gulp.dest('build/app'));

  let resCopy = gulp.src([
    'package.json',
    'styles/**',
    'images/**',
    'node_modules/angular/angular**',
    'node_modules/angular-animate/angular-animate**',
    'node_modules/angular-ui-bootstrap/dist/**',
    'node_modules/bootstrap/dist/**',
    'node_modules/font-awesome/**',
    'node_modules/jquery/dist/**',
    'node_modules/jquery-ui-bundle/*',
    'node_modules/spin.js/spin*.js'], {
      base: '.'
    })
    .pipe(gulp.dest('build/app'));

  let componentsCopy = gulp.src(['app/components/**/*.html', '!**/about.html'], {
    base: 'app'
  }).pipe(gulp.dest('build/app'));

  let siteMapCopy = gulp.src('sitemap.xml')
                    .pipe(replace(/<lastmod>[^<]+<\/lastmod>/g, '<lastmod>' + new Date().toISOString() + '</lastmode>'))
                    .pipe(gulp.dest('build/app'));

  let aboutCopy = gulp.src('app/components/about/about.html', { base: 'app' })
              .pipe(replace(/VERSION/g, packagejson.version))
              .pipe(replace(/AUTHOR/g, packagejson.author.name))
              .pipe(replace(/REPO/g, packagejson.author.url))
              .pipe(replace(/DATE/g, (new Date()).toString()))
              .pipe(gulp.dest('build/app'));

  return merge(homeCopy, resCopy, componentsCopy, siteMapCopy, aboutCopy, gulp.src('build/app/cryptoCalc.js'))
         .pipe(zip('cryptocalc-web.zip'))
         .pipe(gulp.dest('dist'));

});


gulp.task('protractor:run', (done) => {
  const argv = process.argv.slice(3); // forward args to protractor
  cp.spawn(path.join('node_modules', 'protractor', 'bin', 'protractor'), ['test/e2e/conf.js'], {
    stdio: 'inherit'
  }).once('close', done);
});

// Fails on error thrown which are not of expected type
gulp.task('run:test', () => {

  return gulp.src('test/it/test-all.html')
      .pipe(gulp.dest('build/test'))
      .pipe(mochaPhantomJS());
});


gulp.task('protractor:install', (done) => {
  cp.spawn(path.join('node_modules', 'protractor', 'bin', 'webdriver-manager'), ['update'], {
    stdio: 'inherit'
  }).once('close', done);
});

// Need to compile with ts to make test run
// gulp.task('mocha', ['webpack:test'], () => {
//   return gulp.src('test/crypto-lib/cryptolib-test.js')
//     .pipe(mocha());
// });

gulp.task('test', (cb) => runSequence('webpack:test', 'run:test', cb));

gulp.task('default', (cb) => runSequence('clean', 'test', 'webpack:app', 'dist', cb));
