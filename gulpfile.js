/*!
 * Gulp SMPL Layout Builder
 *
 * @version 1.0.0
 * @author HubCrag
 * @type Module gulp
 * @license The MIT License (MIT)
 */

/* Get plugins */
const gulp = require('gulp');
const browserSync = require('browser-sync');
const plumber = require('gulp-plumber');
const fileInclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const svgSprite = require('gulp-svg-sprite');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const webpack = require('webpack-stream');
const ghPages = require('gulp-gh-pages');

gulp.task('deploy', function() {
  return gulp.src('./build/**/*')
    .pipe(ghPages());
});

/* Primary tasks */
gulp.task('default', (done) => {
    gulp.series('serve')(done)
});

gulp.task('serve', (done) => {
    gulp.series('clean', gulp.parallel('html', 'sass', 'js', 'static', 'svgSprite'), 'browsersync', 'watch')(done)
});

gulp.task('build', (done) => {
    gulp.series('clean', gulp.parallel('html', 'sass', 'js', 'static', 'svgSprite'), 'browsersync', 'watch')(done)
});

gulp.task('deploy', (done) => {
    gulp.series('clean', gulp.parallel('html', 'sass', 'js', 'static', 'svgSprite'), 'browsersync', 'watch')(done)
});

/* Html task */
gulp.task('html', () => {
    return gulp.src(['./src/partials/*.html', '!./src/partials/_includes/**/*'])
        .pipe(plumber())
        .pipe(fileInclude({
            prefix: '@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('./build/')).on('end', () => {
            browserSync.reload();
        });
});

/* Sass task */
gulp.task('sass', () => {
    return gulp.src('./src/scss/main.scss')
        .pipe(sass({
            "includePaths": "node_modules"
        }))
        .pipe(autoprefixer())
        .pipe(gulp.dest('./build/assets/css/'))
        .pipe(browserSync.stream({ match: '**/*.css' }));
});

/* JS (webpack) task */
gulp.task('js', () => {
    return gulp.src(['./src/js/**/*'])
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest('./build/assets/js'));
});

gulp.task('static', () => {
    return gulp.src('./src/static/**')
      .pipe(gulp.dest('./build/assets'))
  }
)
/* svg sprite */

gulp.task('svgSprite', () => {
    return gulp.src('./src/static/img/svg/**.svg')
      .pipe(svgSprite({
        mode: {
          stack: {
            sprite: "../sprite.svg" //sprite file name
          }
        },
      }))
      .pipe(gulp.dest('./build/assets/img'));
  }
)

/* Browsersync Server */

gulp.task('browsersync', (done) => {
    browserSync.init({
        server: ["./build", "./src/static"],
        notify: false,
        ui: false,
        online: false,
        ghostMode: {
            clicks: false,
            forms: false,
            scroll: false
        }
    });
    done();
});

/* Watcher */
gulp.task('watch', () => {
    global.isWatching = true;

    gulp.watch("./src/scss/**/*.scss", gulp.series('sass'));
    gulp.watch("./src/partials/**/*.html", gulp.series('html'));
    gulp.watch("./src/js/**/*.*", gulp.series('js'));
    gulp.watch("./config.json", gulp.parallel('html', 'js'));
});


/* FS tasks */
gulp.task('clean', () => {
    return del(['./build/**/*'], { dot: true });
});
