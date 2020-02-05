const path = require('path');
const gulp = require('gulp');
const tap = require('gulp-tap');
const file = require('gulp-file');
const gulpif = require('gulp-if');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const insert = require('gulp-insert');
const merge = require('merge-stream');
const concat = require('gulp-concat');
const exposify = require('exposify');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const buffer = require('vinyl-buffer');
const htmlmin = require('gulp-htmlmin');
const browserify = require('browserify');
const intoStream = require('into-stream');
const runSequence = require('run-sequence');
const Bundler = require('polymer-bundler').Bundler;
const HtmlSplitter = require('polymer-build').HtmlSplitter;

const POLYMER_MANIFEST_PATH = 'src/all-imports.html';
const PLOTLY_PARTIALS_PATH = [
    require.resolve('plotly.js/lib/index-cartesian'),
    require.resolve('plotly.js/lib/index-geo')
];
const OTHER_DEPENDENCIES_PATH = [
    'bower_components/d3/d3.js',
    'bower_components/venn.js/venn.js'
];

gulp.task('bundle-all', ['bundle-core', 'bundle-dependencies'], (callback) => {
    gulp.src('dist/dependencies.js')
        .on('data', (file) => gulp.src('dist/core.html')
                .pipe(insert.prepend(`<script>${file.contents}</script>`))
                .pipe(rename('bundle.html'))
                .pipe(gulp.dest('dist'))
                .on('end', callback));
});

gulp.task('bundle-core', () => {
    const bundler = new Bundler();
    return bundler.generateManifest([POLYMER_MANIFEST_PATH]).then((manifest) => bundler.bundle(manifest).then((result) => {
        let htmlSplitter = new HtmlSplitter();
        let bundleDocument = result.documents.values().next().value;
        return file('core.html', bundleDocument.content)
                .pipe(htmlSplitter.split())
                .pipe(gulpif(/\.js$/, babel({plugins: ['transform-es2015-arrow-functions']})))
                .pipe(htmlSplitter.rejoin())
                .pipe(gulp.dest('dist'));
    }));
});

gulp.task('bundle-dependencies', (callback) => {
    // Bundle required Plotly partials without d3 and merge with other dependencies
    const plotlyBaseDir = path.dirname(PLOTLY_PARTIALS_PATH[0]);
    let plotlyStream = gulp.src(PLOTLY_PARTIALS_PATH)
        .pipe(concat('plotly.js'))
        .pipe(tap((file) => {
            file.contents = browserify(intoStream(file.contents), {standalone: 'Plotly', basedir: plotlyBaseDir})
                .transform(exposify, {expose: {d3: 'd3'}})
                .bundle();
        }))
        .pipe(buffer());

    return merge(gulp.src(OTHER_DEPENDENCIES_PATH), plotlyStream)
        .pipe(concat('dependencies.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('minify', () => gulp.src('dist/*')
        .pipe(gulpif(/\.js$/, uglify()))
        .pipe(gulpif(/\.html$/, htmlmin({minifyCSS: true, minifyJS: true, removeComments: true, collapseWhitespace: true})))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist')));

gulp.task('polyfills', () => gulp.src([
    'bower_components/webcomponentsjs/webcomponents-loader.js',
    'bower_components/webcomponentsjs/webcomponents-loader.min.js'
]).pipe(gulp.dest('dist')));

gulp.task('clean', () => gulp.src('dist', {read: false})
        .pipe(clean()));

gulp.task('bundle', ['clean'], (callback) => runSequence('bundle-all', 'minify', 'polyfills', callback));
gulp.task('default', ['bundle']);
