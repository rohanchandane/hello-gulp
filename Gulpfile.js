'use strict';
var gulp = require('gulp');
var moment = require('moment');
// var $ = require('gulp-load-plugins');

var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var imagemin = require('gulp-imagemin');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var rev = require('gulp-rev');
var inject = require('gulp-inject');
var useref = require('gulp-useref');
// var fixmyjs = require('gulp-fixmyjs');

var paths = {
  scripts: ['app/scripts/**/*.js'],
  images: 'app/assets/images/**/*.png',
  html: 'app/**/*.html',
  css: 'app/assets/css/*.css',
  dist: 'dist/',
  temp: '.tmp/'
};

gulp.task('useref1', function () {
  var assets = useref.assets();

  return gulp.src('app/index.html')
    .pipe(assets)
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(gulp.dest(paths.dist));
})

gulp.task('jshint-jscs', function () {
  return gulp.src(paths.scripts)
    //.pipe(fixmyjs())
    .pipe(jscs())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('clean', function () {
  return gulp.src(paths.dist)
    .pipe(clean());
});

// ['clean'] is dependacy, that means until clean finishes, it won't run 'html'
gulp.task('html', ['clean'], function () {
  var options = {
    empty: true,
    conditionals: true,
    spare:true,
    quotes: true
 };
  return gulp.src(paths.html)
    .pipe(minifyHtml(options))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('css', ['clean'], function () {
  var options = {
    compatibility: 'ie8'
  };
  return gulp.src(paths.css)
    // sourcemaps init() should be called before minitfication
    .pipe(sourcemaps.init())
    .pipe(minifyCss(options))
    .pipe(concat('all.min.css'))
    // sourcemaps write will add bookmark comment into file after it finishes processing all pipes
    .pipe(sourcemaps.write())
    .pipe(rev()) // adds random no in the file name, for caching
    .pipe(gulp.dest(paths.dist));
});

// ['clean'] is dependacy, that means until clean finishes, it won't run 'imagemin'
gulp.task('imagemin', ['clean'], function () {
  return gulp.src(paths.images)
    // .use(imagemin.optipng({optimizationLevel: 3}))
    .pipe(imagemin())
    .pipe(gulp.dest(paths.dist + 'assets/images/'));
});

// ['clean'] is dependacy, that means until clean finishes, it won't run 'clean'
gulp.task('uglify-concat-copy', ['clean'], function () {
  return gulp.src(paths.scripts)
    // sourcemaps init() should be called before minitfication
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(concat('all.min.js'))
    // sourcemaps write will add bookmark comment into file after it finishes processing all pipes
    .pipe(sourcemaps.write())
    .pipe(rev()) // adds random no in the file name, for caching
    .pipe(gulp.dest(paths.dist));
});

gulp.task('watch', function () {
  gulp.watch([paths.scripts, paths.html, paths.css, paths.images], ['build']);
});

gulp.task('build', ['jshint-jscs', 'clean', 'html', 'css', 'imagemin', 'uglify-concat-copy'], function () {
  // following code will inject newly created js and css bundle into index.html with its chache controlled name
  var target = gulp.src('app/index.html');
  var sourceOptions = {
    // Do not add a root slash to the beginning of the path
    addRootSlash: false,
    // Remove the `dist` from the path when doing the injection
    ignorePath: 'dist'
  }
  // It's not necessary to read the files (will speed up things), we're only after their paths:
  var sources = gulp.src([ paths.dist + '*.js', paths.dist + '*.css'], {read: false});

  return target.pipe(inject(sources, sourceOptions))
    .pipe(gulp.dest(paths.dist));
});

// things to add for angular project
// 1. (Optional)
// - gulp-angular-templatecache for using $templateCache feature in angular js
// http://www.johnpapa.net/angular-and-gulp/

// 2. (Mandatory, Alternative)
// - gulp-inject for injecting file references into index.html
// https://www.npmjs.com/package/gulp-inject

// 3. (Alternative)
// - gulp-useref for parsing build block in HTML (like js or css) minify them and add minified references in updated version of HTML
// - can be used with gulp-if, gulp-uglify, gulp-minify-css
// https://www.npmjs.com/package/gulp-useref

// 4. (Mandatory)
// - gulp-rev for adding random no in the file name, for caching
// https://github.com/sindresorhus/gulp-rev

// 5. (Optional)
// - ng-annotate adds and removes AngularJS dependency injection annotations. (https://github.com/olov/ng-annotate)
// - gulp-ng-annotate Add angularjs dependency  annotations with ng-annotate
// https://github.com/Kagami/gulp-ng-annotate

// 6. (Optional)
// - gulp-util provides many utility functions like log(), beep(), replaceExtension(), template(), noop() etc
// https://github.com/gulpjs/gulp-util

// 7. (Optional)
// gulp-notify helps to add notification msg inbetween running task
// https://www.npmjs.com/package/gulp-notify

// 8. (Optional)
// gulp-print: Prints names of files to the console so that you can see what's going through the the gulp pipe.

// 9. (Optional)
// gulp-if: add conditionals statement in gulp code
// https://github.com/robrich/gulp-if

// 10. (Non gulp plugin)
// yargs: allows to acess agruments via command line and read it using this plugin
// https://www.npmjs.com/package/yargs (example is on this page)

// 11. (Good to have)
// gulp-load-plugins: gets and load all mentioned plugin, also help in lazy loading those plugins
// https://www.npmjs.com/package/gulp-load-plugins

// 12. (Optional)
// gulp-complexity: calculate code complexity

// 13. (Optional)
// gulp-fixmyjs fixes small js errors like semicolons, double equal to
// https://www.npmjs.com/package/gulp-fixmyjs
