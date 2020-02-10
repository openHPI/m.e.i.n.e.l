const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const minify = require('gulp-terser-js');
const minifyHtml = require('minify-html-literals');
const concat = require('gulp-concat');
const insert = require('gulp-insert');
const merge = require('merge-stream');
const order = require('gulp-order');
const browserify = require('browserify');
const intoStream = require('into-stream');
const buffer = require('vinyl-buffer');
const tap = require('gulp-tap');
const rollup = require('gulp-rollup');
const rollupResolve = require('rollup-plugin-node-resolve');
const rollupCommonjs = require('rollup-plugin-commonjs');
const PolymerProject = require('polymer-build').PolymerProject;
const babelPreset = require('@babel/preset-env');

const WEB_COMPONENTS_POLYFILL = require.resolve('@webcomponents/webcomponentsjs/webcomponents-bundle.js');

const WEB_COMPONENTS_ES5_ADAPTER = require.resolve('@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js');
const IE_POLYFILLS = require.resolve('@babel/polyfill/dist/polyfill.min.js');

const PLOTLY_PARTIALS_PATH = [
    require.resolve('plotly.js/lib/index-cartesian'),
    require.resolve('plotly.js/lib/index-geo')
];

const bundle = (options) => {
    // Bundle main sources and dependencies
    const project = new PolymerProject(JSON.parse(fs.readFileSync('./polymer.json', 'utf8')));
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const projectName = packageJson.name.replace(/\./g, '');

    /**
     * Bundle source stream with all dependencies as imported in the code files
     */
    let bundleStream = merge(project.sources(), project.dependencies());

    bundleStream = bundleStream
        .pipe(tap((file) => {
            const minifiedHtml = minifyHtml.minifyHTMLLiterals(
                file.contents.toString(),
                {
                    fileName: file.path,
                    shouldMinify(template) {
                        return (
                            minifyHtml.defaultShouldMinify(template) ||
                            template.parts.some(part =>
                                // Matches Polymer templates that are not tagged
                                (
                                    part.text.includes('<style') ||
                                    part.text.includes('<dom-module')
                                )
                            )
                        );
                    }
                });
            file.contents = minifiedHtml ? intoStream(minifiedHtml.code) : file.contents;
        }))
        .pipe(buffer())
        .pipe(gulpif(options.compile, babel({
            presets: [
                [
                    babelPreset,
                    {
                        targets: {
                            'ie': '11'
                        },
                        useBuiltIns: 'usage',
                        corejs: 2
                    }
                ]
            ]
        })))
        .pipe(rollup({
            allowRealFiles: true,
            input: project.config.entrypoint,
            output: {
                format: 'iife',
                name: `${projectName}`

            },
            onwarn: warning => {
                if (/Circular dependency:/.test(warning)) return;
                console.warn(`[ROLLUP] ${warning}`);
            },
            plugins: [
                rollupResolve({
                    mainFields: ['module', 'jsnext', 'main']
                }),
                rollupCommonjs({
                    namedExports: {
                        'fmin': ['nelderMead', 'bisect', 'conjugateGradient', 'zeros', 'zerosM', 'norm2', 'scale']
                    }
                })
            ]
        }))
        .pipe(minify({
            compress: {
                sequences: false
            },
            output: {
                comments: false
            }
        }));


    /**
     *  Bundle required Plotly.js partials
     */
    const plotlyBaseDir = path.dirname(PLOTLY_PARTIALS_PATH[0]);
    let plotlyStream = gulp.src(PLOTLY_PARTIALS_PATH)
        .pipe(concat('plotly.js'))
        .pipe(tap((file) => {
            file.contents = browserify(intoStream(file.contents), { standalone: 'Plotly', basedir: plotlyBaseDir })
                .bundle();
        }))
        .pipe(buffer())
        .pipe(minify({ output: { comments: false } }));


    /**
     *  Merge both streams and ensure plotly is loaded first
     */
    return merge(plotlyStream, bundleStream)
        .pipe(order(['plotly.js', project.config.entrypoint]))
        .pipe(concat(`${projectName}-bundle.js`))
        .pipe(insert.prepend(`/* ${packageJson.name} v${packageJson.version} */\n`))
        .pipe(gulp.dest(options.dest));
};


const polyfills = (options) => {
    /**
     *  Bundle polyfills for IE and ES5 browsers
     */
    let polyfillsStream = gulp.src(WEB_COMPONENTS_POLYFILL);

    if(options.compile) {
        polyfillsStream = merge(
            polyfillsStream,
            gulp.src(WEB_COMPONENTS_ES5_ADAPTER),
            gulp.src(IE_POLYFILLS).pipe(concat('polyfills-ie.js'))
        );
    }
    return polyfillsStream.pipe(gulp.dest(options.dest));
};


const cleanDir = (dir) => gulp.src(dir, { read: false, allowEmpty: true }).pipe(clean());
gulp.task('clean-es5', () => cleanDir('build/es5'));
gulp.task('clean-es6', () => cleanDir('build/es6'));
gulp.task('clean', gulp.parallel('clean-es5', 'clean-es6'));

gulp.task('polyfills-es5', () => polyfills({ compile: true, dest: 'build/es5' }));
gulp.task('polyfills-es6', () => polyfills({ compile: false, dest: 'build/es6' }));
gulp.task('polyfills', gulp.parallel('polyfills-es5', 'polyfills-es6'));

gulp.task('bundle-es5', () => bundle({ compile: true, dest: 'build/es5' }));
gulp.task('bundle-es6', () => bundle({ compile: false, dest: 'build/es6' }));
gulp.task('bundle', gulp.series('clean', gulp.parallel('polyfills', 'bundle-es5', 'bundle-es6')));

gulp.task('default', gulp.series('bundle'));
