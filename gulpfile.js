var gulp = require('gulp');
var browserify = require('gulp-browserify');

gulp.task('default', function() {
  gulp.src('lib/spybot-browser.js')
    .pipe(browserify())
    .pipe(gulp.dest('./build/js'));
});
