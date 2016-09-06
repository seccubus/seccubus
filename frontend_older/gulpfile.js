/* jshint node:true */
'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var traceurConfig = require('./config/traceur.config');

gulp.task('transpile', function() {
    return gulp.src('client/app/**/*.js')
        .pipe($.traceur(traceurConfig))
        .pipe(gulp.dest('client/app.compiled'));
});

gulp.task('styles', function() {
    return gulp.src('client/styles/app.less')
        .pipe($.sourcemaps.init())
        .pipe($.less())
        .pipe($.autoprefixer('last 1 version'))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('client/app.compiled/styles'))
        .pipe($.size());
});

gulp.task('jshint', function() {
    return gulp.src('client/app/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.jshint.reporter('fail'));
});

gulp.task('images', function() {
    return gulp.src('client/images/**/*')
        .pipe($.cache($.imagemin({
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function() {
    return gulp.src(require('main-bower-files')().concat('client/fonts/**/*'))
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest('dist/fonts'));
});

gulp.task('clean', require('del').bind(null, ['client/app.compiled']));

gulp.task('connect', ['styles', 'transpile'], function() {
    var serveStatic = require('serve-static');
    var serveIndex = require('serve-index');
    var app = require('connect')()
        .use(require('connect-livereload')({
            port: 35729
        }))
        .use(serveStatic('client'))
        .use('/node_modules', serveStatic('node_modules'))
        .use(serveIndex('client'));

    require('http').createServer(app)
        .listen(9123)
        .on('listening', function() {
            console.log('Started connect web server on http://localhost:9123');
        });
});

gulp.task('serve', ['connect', 'watch'], function() {
    require('opn')('http://localhost:9123');
});

// inject bower components
gulp.task('wiredep', function() {
    var wiredep = require('wiredep').stream;

    gulp.src('client/styles/*.less')
        .pipe(wiredep())
        .pipe(gulp.dest('client/styles'));

    gulp.src('client/*.html')
        .pipe(wiredep())
        .pipe(gulp.dest('client'));
});

gulp.task('watch', ['connect'], function() {
    $.livereload.listen();

    // watch for changes
    gulp.watch([
        'client/*.html',
        'client/app/components/**/*.html',
        'client/app.compiled/styles/**/*.css',
        'client/app.compiled/**/*.js',
        'client/images/**/*'
    ]).on('change', $.livereload.changed);

    gulp.watch('client/app/**/*.js', ['transpile']);
    gulp.watch('client/styles/**/*.less', ['styles']);
    gulp.watch('bower.json', ['wiredep']);
});

gulp.task('build', ['transpile', 'jshint', 'images', 'fonts'], function() {
    return gulp.src('dist/**/*').pipe($.size({
        title: 'build',
        gzip: true
    }));
});

gulp.task('default', ['clean'], function() {
    gulp.start('build');
});

// gulp.task('html', ['styles'], function() {
//     var assets = $.useref.assets({
//         searchPath: '{build,app}'
//     });

//     return gulp.src('client/*.html')
//         .pipe(assets)
//         .pipe($.if('*.js', $.uglify()))
//         .pipe($.if('*.css', $.csso()))
//         .pipe(assets.restore())
//         .pipe($.useref())
//         .pipe($.if('*.html', $.minifyHtml({
//             conditionals: true,
//             loose: true
//         })))
//         .pipe(gulp.dest('dist'));
// });

// gulp.task('extras', function() {
//     return gulp.src([
//         'client/*.*',
//         '!client/*.html',
//         'node_modules/apache-server-configs/dist/.htaccess'
//     ], {
//         dot: true
//     }).pipe(gulp.dest('dist'));
// });
