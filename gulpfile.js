var gulp = require("gulp");
var browserify = require("browserify");
var watchify = require("watchify");
var underscorify = require("node-underscorify");
var source = require("vinyl-source-stream");
var gutil = require("gulp-util");
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var path = require('path');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var babelify = require('babelify');

//Server
var paths = {
	es6: ['es6server/**/*.js'],
	es5: 'es5server',
	sourceRoot: path.join(__dirname, 'es6server')
};

gulp.task('es6to5server', function (){
	return gulp.src(paths.es6)
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(sourcemaps.write('.', {sourceRoot: paths.sourceRoot}))
		.pipe(gulp.dest(paths.es5));
});

//Client

gulp.task('build:js', function(){
	return browserify({
		entries: './browserify-babel/index.js',
		debug: true,
	}).transform(underscorify.transform())
	.transform(babelify).bundle()
	.on("error", gutil.log.bind(gutil, 'Browserify Error'))
	.on("log", gutil.log)
	.pipe(source("app_browserify_babel.js"))
	.pipe(buffer())
	.pipe(gulp.dest("./public/js"));
});

gulp.task('watch', function (){
	gulp.watch(paths.es6, ['es6to5server']);
	gulp.watch(['browserify-babel/**/*.js'], ['build:js']);
});

gulp.task('default', ['watch']);

/*
	Build Client with watchify
*/

var mainBundler = watchify(browserify("./browserify/index.js"));
mainBundler.transform(underscorify.transform());
mainBundler.transform(babelify);
mainBundler.on("update", bundleMain);
mainBundler.on("log", gutil.log);

function bundleMain() {
	return mainBundler.bundle()
		.on("error", gutil.log.bind(gutil, 'Browserify Error'))
		.pipe(source("app.js"))
		.pipe(buffer())
		.pipe(uglify())
		.pipe(gulp.dest("./public/js"));
}

gulp.task("watchify-main", bundleMain);