var gulp = require('gulp');
var $ = require('gulp-load-plugins')();


gulp.task('jscs', function() {
    return gulp.src('index.js')
        .pipe($.jscs())
        .pipe($.jscs.reporter());
});

gulp.task('jshint', function() {
    return gulp.src('index.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-reporter-jscs'))
        .pipe($.jshint.reporter('fail'));
});

gulp.task('test', function() {
    return gulp.src('spec.js', { read: false })
        .pipe($.mocha({
            reporter: 'spec'
        }));
});

gulp.task('default', ['jshint', 'jscs', 'test']);