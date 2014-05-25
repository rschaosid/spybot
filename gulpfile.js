var gulp = require('gulp');
var browserify = require('gulp-browserify');
var jshint = require('gulp-jshint');
var jshint_stylish = require('jshint-stylish');

var scripts = ['./lib/**/*.js'] //, './test/**/*.js']

gulp.task('watch', function() {
  gulp.watch(scripts, ['lint', 'build']);
});

gulp.task('lint', function() {
  gulp.src(scripts)
    .pipe(jshint())
    .pipe(jshint.reporter(jshint_stylish))
    .pipe(jshint.reporter('fail'));
});

gulp.task('build', function() {
  gulp.src('lib/spybot-browser.js')
    .pipe(browserify())
    .pipe(gulp.dest('./build/js'));
});
