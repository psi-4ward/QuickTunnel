var commander = require('commander');
var exec = require('child_process').exec;

var src = __dirname + '/src/';
var dist = __dirname + '/dist/';
var build = __dirname + '/build/';
var packageJsonData = require(src+'package.json');

var libs = [
  'bower_components/angular/angular.js',
  'bower_components/angular-ui-router/release/angular-ui-router.js'
];

commander
//  .version('1.0.0')
  .usage('task [task task ...] [options]')
  .option('-T, --tasks', 'Show gulp tasks')
  .option('--port <port>', 'Start the webserver on sepcifc port, default 9000', 9000)
  .on('--help', function() {
    console.log('  Common tasks');
    console.log(' ');
    console.log('    build            Build the app');
    console.log('    server           Only start a webserver');
    console.log('    dev              build without minify and start server with livereload');
    console.log(' ');
  })
  .parse(process.argv);

var gulp = require('gulp');
var gutil = require('./node_modules/gulp/node_modules/gulp-util/index.js');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var insert = require('gulp-insert');
var sourcemaps = require('gulp-sourcemaps');

var del = require('del');
var NwBuilder = require('node-webkit-builder');
var runSequence = require('run-sequence');


var buildTasks = ['app', 'libs', 'less', 'jshint', 'copyHtml', 'copyAssets', 'copyPackageJson', 'copyNodeModules'];

/** generic build task **/
gulp.task('build', function(cb) {
  runSequence('clean', buildTasks, 'compile', 'copyPutty', cb);
});

/** dev task **/
gulp.task('dev', function(cb) {
  runSequence('clean', buildTasks, ['livereload', 'watch'], 'nodewebkit', cb);
});


function error(msg) {
  console.error('['+gutil.colors.red('error')+'] ' + msg);
  process.exit(1);
}

gulp.task('default', function() {
  commander.help();
});

/* JSHint */
gulp.task('jshint', function() {
  return gulp.src([src + '**/*.js', '!' + src + 'node_modules/**/*'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});


/* Concat app */
gulp.task('app', function() {
  return gulp.src([src + 'app.js', src + '**/*.js', '!' + src + 'node_modules/**/*'])
    .pipe(sourcemaps.init())
      .pipe(concat('app.js'))
      .pipe(insert.wrap('!function(){ "use strict";'+"\n", "\n}();"))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dist))
});

/* Concat libs */
gulp.task('libs', function() {
  return gulp.src(libs)
    .pipe(concat('libs.js'))
    .pipe(gulp.dest(dist))
});

/* remove build folder */
gulp.task('clean', function(next) {
  del([dist, build], next);
});

/* copy HTML */
gulp.task('copyHtml', function() {
  return gulp.src(src + '**/*.html')
    .pipe(gulp.dest('dist'));
});

/* copy assets */
gulp.task('copyAssets', function() {
  return gulp.src(src + 'assets/**/*')
    .pipe(gulp.dest('dist'));
});

/* copy node_modules */
gulp.task('copyNodeModules', function() {
  return gulp.src(src + 'node_modules/**/*')
    .pipe(gulp.dest('dist/node_modules'));
});

/* copy package.json */
gulp.task('copyPackageJson', function() {
  return gulp.src([src + 'package.json']) //, src + 'quicktunnel.yaml'
    .pipe(gulp.dest('dist'));
});

/* LESS */
gulp.task('less', function() {
  return gulp.src(src + 'less/style.less')
    .pipe(less())
    .pipe(gulp.dest('dist'));
});

/* watchers */
gulp.task('watch', ['livereload'], function() {
  gulp.watch([src + '**/*.js'], ['app', 'jshint']);
  gulp.watch([src + '**/*.html'], ['copyHtml']);
  gulp.watch([src + 'assets/*'], ['copyAssets']);
  gulp.watch([src + 'package.json'], ['copyPackageJson']);
  gulp.watch([src + 'less/**/*.less'], ['less']);
});


/* Node-webkit instance */
var nwProcess;
gulp.task('nodewebkit', buildTasks, function(cb) {
  nwProcess = exec('nw .', {cwd: dist}, function() {
    cb();
  });
  nwProcess.stdout.pipe(process.stdout);
  nwProcess.stderr.pipe(process.stderr);
});

/* Node-webkit-builder */
gulp.task('compile', function(cb) {
  var nw = new NwBuilder({
    files: __dirname + '/dist/' + '/**/**',
    appName: packageJsonData.name,
    appVersion: packageJsonData.version,
    buildDir: build,
    platforms: ['win', 'osx', 'linux64']
  });
  //nw.on('log', console.log);
  nw.build(cb);
});
gulp.task('copyPutty', function() {
  return gulp.src(src+'putty/*')
    .pipe(gulp.dest(build+ packageJsonData.name+'/win'));
});


  /* Livereload */
gulp.task('livereload', buildTasks, function() {
  var livereload = require('gulp-livereload');
  livereload.listen();
  gulp.watch([dist + '**/*']).on('change', livereload.changed);
  gulp.watch(dist + 'package.json').on('change', function() {
    nwProcess.kill();
    setTimeout(function() {
      gulp.start('nodewebkit');
    }, 300);
  });
});


