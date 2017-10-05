/**
 * Created by CityLife on 13.02.17.
 */

/* Gulp plugins */
var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    babel = require('gulp-babel'),
    babili = require('babili'),//минифицирует es6 без транспиляции
    cleancss = require('gulp-clean-css'),
    csscomb = require('gulp-csscomb'),
    del = require('del'),
    jshint = require('gulp-jshint'),
    path = require('path'),
    pump = require('pump'),
    runSequence = require('run-sequence').use(gulp),
    scss = require('gulp-sass'),
    strip = require('gulp-strip-comments'),//чистим комменты в несжимаемых скриптах
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify');


/* Paths */
var projectPath = {
    build: {
        fonts: 'build/fonts/',
        html: 'build/',
        img: 'build/img/',
        js: 'build/js/',
        serviceFiles: 'build/',
        styles: 'build/styles/'
    },

    src: {
        fonts: 'src/fonts/**/*.*',
        html: ['src/*.html', '!src/modal.html'],
        img: 'src/img/**/*.*',
        jsES6: ['src/js/punycode.js'],
        js: ['src/js/*.js', '!src/js/punycode.js'],
        serviceFiles: ['src/info.plist','Settings.plist'],
        scss: ['src/styles/popup.scss', 'src/styles/modal.scss']
    },

    clean: ['build/**/*', '!build/.gitignore']
};


/* Clean */
gulp.task('clean', function () {
    del(projectPath.clean);
});

/* Fonts */
gulp.task('fonts', function () {
    return gulp.src(projectPath.src.fonts)
        .pipe(gulp.dest(projectPath.build.fonts))
});


/* HTML */
gulp.task('html', function () {
    return gulp.src(projectPath.src.html)
        .pipe(gulp.dest(projectPath.build.html))
});


/* Images */
gulp.task('images', function () {
    return gulp.src(projectPath.src.img)
        .pipe(gulp.dest(projectPath.build.img))
});


/* JavaScript */
gulp.task('jsES6', function (cb) {
    pump([
            gulp.src(projectPath.src.jsES6),
            jshint(),
            jshint.reporter(stylish),
            babel({presets: ['es2015']}),
            // babel({presets: ['babili']}),//сжатие
            //strip(),//если надо убрать комменты
            gulp.dest(projectPath.build.js)
        ],
        cb
    );
});

gulp.task('js', function (cb) {
    pump([
            gulp.src(projectPath.src.js),
            // jshint(),
            // jshint.reporter(stylish),
            // (uglify().on('error', function (e) {//не используем сжатие нигде
            //     console.log(e);
            // })),
            strip(),//если надо убрать комменты
            gulp.dest(projectPath.build.js)
        ],
        cb
    );
});


/* Manifest */
gulp.task('serviceFiles', function () {
    return gulp.src(projectPath.src.serviceFiles)
        .pipe(gulp.dest(projectPath.build.serviceFiles))
});


/* SCSS */
gulp.task('scss', function () {
    return gulp.src(projectPath.src.scss)
        .pipe(scss().on('error', scss.logError))
        .pipe(autoprefixer([
            'iOS >= 6',
            'Safari >= 6'
        ]))
        .pipe(csscomb())
        // .pipe(cleancss())
        .pipe(gulp.dest(projectPath.build.styles))
});


/* Build */
gulp.task('build', function (cb) {
    runSequence(
        'clean',
        'fonts',
        'html',
        'images',
        'jsES6',
        'js',
        'serviceFiles',
        'scss',
        cb
    )
});


/* Default */
gulp.task('default', ['build'], function () {

});