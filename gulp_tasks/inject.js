const gulp = require('gulp');
const browserSync = require('browser-sync');
const wiredep = require('wiredep').stream;
const angularFilesort = require('gulp-angular-filesort');
const gulpInject = require('gulp-inject');

const conf = require('../conf/gulp.conf');








gulp.task('inject', inject);

function inject() {

  const injectScripts = gulp.src([
    conf.path.src('/**/*.js'),
    `!${conf.path.tmp('**/*.spec.js')}`
  ])
    .pipe(angularFilesort()).on('error', conf.errorHandler('AngularFilesort'));

  const injectOptions = {
    ignorePath: [conf.paths.src, conf.path.tmp('/serve')],
    addRootSlash: false
  };

  var injectStyles = gulp.src([
    //    path.join(conf.paths.tmp, '/serve/app/main.css'),
    // path.join(conf.paths.src, 'styles/assets/**/*.css'),
    conf.path.src('/**/*.css'),
    // path.join(conf.paths.src, '/**/*.css'),    
    `!${conf.path.tmp('/serve/app/vendor.css')}`
    // path.join('!' + conf.paths.tmp, '/serve/app/vendor.css')
  ], { read: false });

  // return gulp.src(conf.path.src('/index.html'))
  //   .pipe(gulpInject(injectStyles, injectOptions))
  //   .pipe(gulpInject(injectScripts, injectOptions))
  //   .pipe(wiredep(Object.assign({}, conf.wiredep)))
  //   .pipe(gulp.dest(conf.paths.tmp))
  //   .pipe(gulp.dest(conf.paths.src))
  //   .pipe(browserSync.stream());

// The new oine comes here


return gulp.src(conf.path.src('index.html'))
    .pipe(gulpInject(injectStyles, injectOptions))
    .pipe(gulpInject(injectScripts, injectOptions))
    .pipe(wiredep(Object.assign({}, conf.wiredep)))
    .pipe(gulp.dest(conf.path.tmp('')))
    .pipe(gulp.dest(conf.path.src('')))
    .pipe(browserSync.stream());






}
