'use-strict'


const gulp = require('gulp');
const browserSync = require('browser-sync');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
var path = require('path');
const autoprefixer = require('autoprefixer');

var _ = require('lodash');
var $ = require('gulp-load-plugins')();
var wiredep = require('wiredep').stream;

const conf = require('../conf/gulp.conf');

gulp.task('styles', styles);

function styles() {

  var sassOptions = {
    style: 'expanded'
  };

  var injectFiles = gulp.src([
    conf.path.src('styles/sass/**/_*.scss'),
    '!' + path.join(conf.paths.src, '/sass/theme/conf/**/*.scss'),
    '!' + path.join(conf.paths.src, '/sass/404.scss'),
    '!' + path.join(conf.paths.src, '/sass/auth.scss')
  ], { read: false });

  console.log("Injection File", conf.path.src('styles/sass/**/_*.scss'));

  var injectOptions = {
    transform: function (filePath) {
      filePath = filePath.replace(conf.paths.src + 'styles/sass/', '');
      return '@import "' + filePath + '";';
    },
    starttag: '// injector',
    endtag: '// endinjector',
    addRootSlash: false
  };


  // return gulp.src(conf.path.src('styles/**/_*.scss')) //conf.path.src('index.scss'))
  //   .pipe(sourcemaps.init())
  //   .pipe(sass({ outputStyle: 'expanded' })).on('error', conf.errorHandler('Sass'))
  //   .pipe(postcss([autoprefixer()])).on('error', conf.errorHandler('Autoprefixer'))
  //   .pipe(sourcemaps.write())
  //   .pipe(gulp.dest(conf.path.tmp()))
  //   .pipe(browserSync.stream());



  return gulp.src([
    path.join(conf.paths.src, 'styles/sass/!(_)*.scss')
  ])
    .pipe($.inject(injectFiles, injectOptions))
    .pipe(wiredep(_.extend({}, conf.wiredep)))
    .pipe($.sourcemaps.init())
    .pipe($.sass(sassOptions)).on('error', conf.errorHandler('Sass'))
    //.pipe($.autoprefixer()).on('error', conf.errorHandler('Autoprefixer'))
    .pipe(postcss([autoprefixer()])).on('error', conf.errorHandler('Autoprefixer'))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(path.join(conf.paths.src, '/styles/')))
    .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/styles/'))); 

}
