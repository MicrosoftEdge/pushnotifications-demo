const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const del = require('del');

const dirs = {
    dist: 'dist',
    compresseable: 'dist/**/*.{css,html,ico,js,svg,txt,xml,webmanifest}',
    src: 'src'
};

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('clean', () => {
    return del(dirs.dist);
});

// Copies all the files that are not taken care but optimizations into `dist`
gulp.task('copy:others', () => {
    return gulp.src(`${dirs.src}/**/*.ico`)
        .pipe(gulp.dest(`${dirs.dist}`));
});

// Optimizes JS using uglify saving the results into `dist`
gulp.task('optimize:js', () => {
    return gulp.src(`${dirs.src}/**/*.js`)
        //.pipe(plugins.uglify())
        .pipe(gulp.dest(dirs.dist));
});

// Optimizes CSS using clean css saving the results into `dist`
gulp.task('optimize:css', () => {
    return gulp.src(`${dirs.src}/**/*.css`)
        .pipe(plugins.cleanCss())
        .pipe(gulp.dest(dirs.dist));
});

// Cache busts the static files in `dist` deleting the source file (also from `dist`)
gulp.task('revfiles', () => {
    return gulp.src([`${dirs.dist}/{images,styles,scripts}/**/*`])
        .pipe(plugins.rev())
        .pipe(plugins.revDeleteOriginal())
        .pipe(gulp.dest(`${dirs.dist}`))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest(`${dirs.dist}`));
});

// Updates all the references to static assets using the manifest created in `revfiles`
gulp.task('revreplace', () => {
    const manifest = gulp.src(`${dirs.dist}/rev-manifest.json`);

    return gulp.src(`${dirs.dist}/**/*`)
        .pipe(plugins.revReplace({
            manifest
        }))
        .pipe(gulp.dest(dirs.dist));
});

// Optimizes HTML files using htmlmin saving the results into `dist`
gulp.task('optimize:html', () => {

    const htmlminOptions = {
        caseSensitive: true,
        collapseBooleanAttributes: false,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        preserveLineBreak: true,
        removeAttributeQuotes: false,
        removeComments: true,
        removeCommentsFromCDATA: false,
        removeEmptyAttributes: false,
        removeOptionalTags: false,
        removeRedundantAttributes: false
    };

    return gulp.src(`${dirs.src}/**/*.html`)
        .pipe(plugins.htmlmin(htmlminOptions))
        .pipe(gulp.dest(dirs.dist));
});

// Optimizes images using imagemin and saving into `dist`
gulp.task('imagemin', () => {
    return gulp.src(`${dirs.src}/**/*.{gif,ico,jpg,png,svg}`)
        .pipe(plugins.imagemin())
        .pipe(gulp.dest(dirs.dist));
});

// Adds the `sri` attribute for CSS and JS of all HTML files in `dist`
gulp.task('sri', () => {
    return gulp.src(`${dirs.dist}/**/*.html`)
        .pipe(plugins.sriHash())
        .pipe(gulp.dest(dirs.dist));
});

// Compresses all the compreseable files in `dist` using zopfli
gulp.task('compress:zopfli', () => {
    return gulp.src(dirs.compresseable)
        .pipe(plugins.zopfli())
        .pipe(gulp.dest(dirs.dist));
});

// Compresses all the compreseable files in `dist` using Brotli
gulp.task('compress:brotli', () => {
    return gulp.src(dirs.compresseable)
        .pipe(plugins.brotli.compress())
        .pipe(gulp.dest(dirs.dist));
});

// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

gulp.task('build', gulp.series(
    'clean',
    'optimize:js',
    'optimize:css',
    'imagemin',
    'optimize:html',
    'revfiles',
    'revreplace',
    'sri',
    'compress:zopfli',
    'compress:brotli'
));

gulp.task('default', gulp.series('build'));
