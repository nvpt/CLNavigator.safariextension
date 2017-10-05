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
    uglify = require('gulp-uglify'),
    watch = require('gulp-watch');


/* Paths */
var projectPath = {
    build: {
        fonts: 'cl-navigator.safariextension/fonts/',
        html: 'cl-navigator.safariextension/',
        img: 'cl-navigator.safariextension/img/',
        js: 'cl-navigator.safariextension/js/',
        styles: 'cl-navigator.safariextension/styles/'
    },

    src: {
        fonts: 'src/fonts/**/*.*',
        html: ['src/*.html', '!src/modal.html'],
        img: 'src/img/**/*.*',
        js: ['src/js/*.js', '!src/js/punycode.js'],
        jsES6: ['src/js/punycode.js'],
        scss: ['src/styles/popup.scss', 'src/styles/modal.scss']
    },

    watch: {
        fonts: 'src/fonts/**/*.*',
        html: 'src/**/*.html',
        img: 'src/img/**/*.*',
        js: 'src/js/**/*.js',
        scss: 'src/styles/**/*.scss'
    },

    clean: ['cl-navigator.safariextension/**/*', '!cl-navigator.safariextension/.gitignore', '!cl-navigator.safariextension/info.plist']
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

gulp.task('jsES6', function (cb) {
    pump([
            gulp.src(projectPath.src.jsES6),
            // jshint(),
            // jshint.reporter(stylish),
            babel({presets: ['es2015']}),
            // babel({presets: ['babili']}),//сжатие
            //strip(),//если надо убрать комменты
            gulp.dest(projectPath.build.js)
        ],
        cb
    );
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

/* Watch */
gulp.task('watch', function () {

    watch([projectPath.watch.js], function () {
        gulp.start('js');
    });

    watch([projectPath.watch.js], function () {
        gulp.start('jsES6');
    });

    watch([projectPath.watch.html], function () {
        gulp.start('html');
    });

    watch([projectPath.watch.scss], function () {
        gulp.start('scss');
    });

    watch([projectPath.watch.img], function () {
        gulp.start('images');
    });

    watch([projectPath.watch.fonts], function () {
        gulp.start('fonts');
    });
});

/* Default */
gulp.task('default', ['watch'], function () {

});