'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('style', function () {
    return gulp.src('./scss/main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(cleanCSS({keepSpecialComments: 0, rebase: false}))
        .pipe(gulp.dest('./../server/public/css/'));
});

gulp.task('style:watch', function () {
    gulp.watch('./scss/**/*.scss', ['style']);
});