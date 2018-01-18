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
    // scss = require('gulp-sass'),
    less = require('gulp-less'),                     // Compile Less to CSS
    lessReporter = require('gulp-less-reporter'),    // Error reporter for gulp-less
    minifycss = require('gulp-minify-css'),          // Minify CSS
    rename = require("gulp-rename"),                 // Rename files
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
        js: ['src/js/**/*.js'],
        // jsES6: ['src/js/punycode.js'],
        less: ['src/styles/popup.less', 'src/styles/modal.less']
    },

    watch: {
        fonts: 'src/fonts/**/*.*',
        html: 'src/**/*.html',
        img: 'src/img/**/*.*',
        js: 'src/js/**/*.js',
        less: 'src/styles/**/*.less'
    },

    clean: ['cl-navigator.safariextension/**/*', '!cl-navigator.safariextension/Settings.plist', '!cl-navigator.safariextension/Info.plist']
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
            // (uglify().on('error', function (e) {//not opera, не используем сжатие нигде
            //     console.log(e);
            // })),
            //strip(),//если надо убрать комменты
            gulp.dest(projectPath.build.js)
        ],
        cb
    );
});

// gulp.task('jsES6', function (cb) {
//     pump([
//             gulp.src(projectPath.src.jsES6),
//             // jshint(),
//             // jshint.reporter(stylish),
//             babel({presets: ['es2015']}),
//             // babel({presets: ['babili']}),//сжатие
//             //strip(),//если надо убрать комменты
//             gulp.dest(projectPath.build.js)
//         ],
//         cb
//     );
// });


/* SCSS */
// gulp.task('scss', function () {
//     return gulp.src(projectPath.src.scss)
//         .pipe(scss().on('error', scss.logError))
//         .pipe(autoprefixer([
//             'iOS >= 8',
//             'Safari >= 9'
//         ]))
//         .pipe(csscomb())
//         // .pipe(cleancss())
//         .pipe(gulp.dest(projectPath.build.styles))
// });


/* LESS */
gulp.task('less', function () {
    return gulp.src(projectPath.src.less)
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        .on('error', lessReporter)
        .pipe(autoprefixer([
            'iOS >= 8',
            'Safari >= 9'
        ]))
        .pipe(csscomb())
        .pipe(gulp.dest(projectPath.build.styles))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        // .pipe(sourcemaps.write('./'))
        // .pipe(size({
        //     title: 'LESS'
        // }))
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
        'js',
        'less',
        cb
    )
});

/* Watch */
gulp.task('watch', function () {

    watch([projectPath.watch.js], function () {
        gulp.start('js');
    });

    watch([projectPath.watch.html], function () {
        gulp.start('html');
    });

    watch([projectPath.watch.less], function () {
        gulp.start('less');
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