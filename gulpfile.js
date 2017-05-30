//var PROJECT_ROOT = __dirname;
var PROJECT_ROOT = './';
var SOURCE_ROOT = PROJECT_ROOT + '/demo';
var DIST_ROOT = PROJECT_ROOT + '/dist';
var LIB_ROOT = PROJECT_ROOT + 'scss';
var LIB_VERSION = require(PROJECT_ROOT + '/package.json').version;

var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');

var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

// Clean
gulp.task('clean', function () {
  return del.sync(DIST_ROOT).then(function (cb) {
    return cache.clearAll(cb);
  });
});

gulp.task('clean:dist', function () {
  return del.sync([DIST_ROOT + '/**/*', '!' + DIST_ROOT + '/images', '!' + DIST_ROOT + '/images/**/*']);
});

// Build sass
gulp.task('sass', function () {
  return gulp
    .src(LIB_ROOT + '/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write())

    .pipe(gulp.dest(DIST_ROOT + '/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task(':build:demo:html', function () {
  return gulp.src(SOURCE_ROOT + '/*.html')
    .pipe(gulp.dest(DIST_ROOT))
    .pipe(browserSync.reload({
      stream: true
    }));
});
gulp.task(':build:demo:js', function () {
  return gulp.src(SOURCE_ROOT + '/js/**/*.js')
    .pipe(gulp.dest(DIST_ROOT))
    .pipe(browserSync.reload({
      stream: true
    }));
});
gulp.task(':build:demo', function () {
  return runSequence([':build:demo:html', ':build:demo:js'])
});

// Watch
gulp.task('watch', function () {
  gulp.watch(LIB_ROOT + '/**/*.scss', ['sass']);
  gulp.watch(SOURCE_ROOT + '/*.html', [':build:demo:html']);
  gulp.watch(SOURCE_ROOT + '/js/**/*.js', [':build:demo:js']);
});

gulp.task('serve', function () {
  browserSync({
    server: {
      baseDir: DIST_ROOT
    }
  })
});


// Optimization Tasks 
// ------------------

// Optimizing CSS and JavaScript 
gulp.task('useref', function () {

  return gulp.src(SOURCE_ROOT + '/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest(DIST_ROOT));
});

// Optimizing Images 
gulp.task('images', function () {
  return gulp.src(SOURCE_ROOT + '/images/**/*.+(png|jpg|jpeg|gif|svg)')
    // Caching images that ran through imagemin
    .pipe(cache(imagemin({
      interlaced: true,
    })))
    .pipe(gulp.dest(DIST_ROOT + '/images'))
});

// Copying fonts 
gulp.task('fonts', function () {
  return gulp.src(SOURCE_ROOT + '/fonts/**/*')
    .pipe(gulp.dest(DIST_ROOT + '/fonts'))
});



// Build Sequences
// ---------------

gulp.task('default', function (callback) {
  runSequence(['build', 'serve'], 'watch',
    callback
  )
});

gulp.task('build', function (callback) {
  runSequence(
    'clean:dist',
    'sass',
    ':build:demo',
    ['useref', 'images', 'fonts'],
    callback
  )
});
