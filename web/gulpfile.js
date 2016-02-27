const gulp = require("gulp");
const gutil = require("gulp-util");
const webpack = require("webpack");
const gulpWebpack = require('gulp-webpack');
const WebpackDevServer = require("webpack-dev-server");
const rimraf = require('rimraf');
const mocha = require('gulp-mocha');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');

const webpackConfig = require('./webpack.config');
const webpackProdConfig = require('./webpack.config.prod');

gulp.task("webpack", ['clean'], function () {
  return gulp.src('app/main.js')
    .pipe(gulpWebpack(webpackProdConfig))
    .pipe(gulp.dest('dist/'));
});

gulp.task("webpack-dev-server", ['prepare'], function (callback) {
  // Start a webpack-dev-server
  var compiler = webpack(webpackConfig);

  new WebpackDevServer(compiler, {
    historyApiFallback: true
    // server and middleware options
  }).listen(9000, "localhost", function (err) {
    if (err) throw new gutil.PluginError("webpack-dev-server", err);
    // Server listening
    gutil.log("[webpack-dev-server]", "http://localhost:8080/webpack-dev-server/index.html");

    // keep the server alive or continue?
    // callback();
  });
});

gulp.task('clean', function (cb) {
  rimraf('./dist', cb);
});

gulp.task('prepare', function () {
  gulp.src('./app/assets/favicon.ico')
    .pipe(gulp.dest('./dist/'));
});

gulp.task('compile-test', function () {
  return gulp.src('spec/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015', 'stage-1', 'stage-0'],
      plugins: ['transform-runtime', 'add-module-exports', 'transform-decorators-legacy']
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/spec'));
});

gulp.task('test', ['compile', 'compile-test'], function () {
  return gulp.src('dist/spec/**/*.js', {read: false})
    .pipe(mocha({
      reporter: 'spec'
    }));
});

gulp.task('compile', function () {
  return gulp.src('app/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015', 'stage-1', 'stage-0', 'react'],
      plugins: ['transform-runtime', 'add-module-exports', 'transform-decorators-legacy']
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/app'));
});

gulp.task('default', ['webpack']);
