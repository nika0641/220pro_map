var gulp = require('gulp'),
	path = require('path'),
	fs = require('fs'),
	rimraf = require('rimraf'),
	spawn = require('child_process').spawn,
	config = require('./config/config.js'),
	notify = require('gulp-notify'),
	gutil = require('gulp-util'),
	plumber = require('gulp-plumber'),
	concat = require('gulp-concat'),
	less = require('gulp-less'),
	uglify = require('gulp-uglify'),
	sourcemaps = require('gulp-sourcemaps'),
	minifyCSS = require('gulp-minify-css'),
	rigger = require('gulp-rigger'),
	watch = require('gulp-watch'),
	rev = require('gulp-rev'),
	revReplace = require('gulp-rev-replace'),
	runSequence = require('run-sequence'),
	browserSync = require('browser-sync'),
	reload = browserSync.reload,
	config = require('./config/config.js');



// Root Dir finding

var production, rootDir;
production = config.get('env') === "production";
process.env['__PROJECT_PATH__'] = __dirname;
rootDir = process.env['__PROJECT_PATH__'] + "/";

// Files Paths

var paths = {
	"js": {
		"source": "assets/js/main.js",
		"watch": ["assets/js/**/*.js"],
		"dest": "public/js",
		"name": "main.js"
	},
	"less": {
		"source": "assets/less/all.less",
		"watch": ["assets/less/**/*.less"],
		"curdir": "assets/less",
		"dest": "public/css",
		"name": "general.css"
	},
	"html": {
		"source": "assets/html/**/*.*",
		"watch": ["assets/html/**/*.jade"],
		"curdir": "assets/html",
		"dest": "views"
	},
	"images": {
		"source": ["assets/images/**/*.*"],
		"watch": ["assets/images/**/*.*"],
		"curdir": "assets/images",
		"dest": "public/images"
	},
	"fonts": {
		"source": ["assets/fonts/**/*.*"],
		"watch": ["assets/fonts/**/*.*"],
		"curdir": "assets/fonts",
		"dest": "public/fonts"
	},
	"node": {
		"watch": ["config/**/*.js", "libs/**/*.js", "tasks/**/*.js", "middleware/**/*.js", "models/**/*.js", "routes/**/*.js", "package.json"]
	},
	"clean": {
		"source": "public"
	}
};

var webserverConfig = {
	files: paths.node.watch.concat(["public/**/*.*", "views/**/*.*"]),
	proxy: 'http://localhost:' + config.get('port'),
	port: 4000,
};



// Less - CSS

gulp.task('less', function() {
	return gulp.src(rootDir + paths.less.curdir + '/all.less')
		.pipe(plumber({
			errorHandler: notify.onError("Error: <%= error.message %>")
		}))
		.pipe(less())
		.pipe(concat(paths.less.name))
		.pipe(production ? minifyCSS({
			keepBreaks: true
		}) : gutil.noop())
		.pipe(rev())
		.pipe(!production ? sourcemaps.write('./', {
			addComment: true,
			loadMaps: true
		}) : gutil.noop())
		.pipe(gulp.dest(rootDir + paths.less.dest))
		.pipe(notify(notifyFile))
		.pipe(rev.manifest({
			merge: true
		}))
		.pipe(gulp.dest(rootDir))
		.pipe(notify(notifyFile))
		.pipe(reload({
			stream: true
		}));
});



// JS

gulp.task('js', function() {
	return gulp.src(paths.js.source)
		.pipe(plumber({
			errorHandler: notify.onError("Error: <%= error.message %>")
		}))
		.pipe(rigger({
			cwd: rootDir
		}))
		.pipe(sourcemaps.init())
		.pipe(concat(paths.js.name))
		.pipe(production ? uglify({
			mangle: false
		}) : gutil.noop())
		.pipe(rev())
		.pipe(!production ? sourcemaps.write('./', {
			addComment: true,
			loadMaps: true
		}) : gutil.noop())
		.pipe(gulp.dest(rootDir + paths.js.dest))
		.pipe(notify(notifyFile))
		.pipe(rev.manifest({
			merge: true
		}))
		.pipe(gulp.dest(rootDir))
		.pipe(notify(notifyFile))
		.pipe(reload({
			stream: true
		}));
});



// html

gulp.task('html', function() {
	return gulp.src(paths.html.source)
		.pipe(plumber({
			errorHandler: notify.onError("Error: <%= error.message %>")
		}))
		.pipe(revReplace({
			replaceInExtensions: ['.jade'],
			manifest: gulp.src(rootDir + "rev-manifest.json")
		}))
		.pipe(gulp.dest(rootDir + paths.html.dest))
		.pipe(notify(notifyFile))
		.pipe(reload({
			stream: true
		}));
});



function notifyFile(file) {
	return "Generate: <%= file.relative %>";
}



// Images

gulp.task('images', function() {
	return gulp.src(paths.images.source)
		.pipe(plumber({
			errorHandler: notify.onError("Error: <%= error.message %>")
		}))
		.pipe(gulp.dest(rootDir + paths.images.dest))
		.pipe(notify(notifyFile))
		.pipe(reload({
			stream: true
		}));
});



// Fonts

gulp.task('fonts', function() {
	return gulp.src(paths.fonts.source)
		.pipe(plumber({
			errorHandler: notify.onError("Error: <%= error.message %>")
		}))
		.pipe(gulp.dest(rootDir + paths.fonts.dest))
		.pipe(notify(notifyFile))
		.pipe(reload({
			stream: true
		}));
});



// Clean 

gulp.task('clean', function(cb) {
	rimraf(rootDir + paths.clean.source, cb);
});



// Server

gulp.task('server', function() {
	spawn('forever', ['stopall'], {
		stdio: 'inherit'
	});

	spawn('forever', ['app.js'], {
		stdio: 'inherit'
	});
});



// Command Line

gulp.task('webserver', function() {
	browserSync(webserverConfig);
});

gulp.task('supfiles', function() {
	runSequence('js', 'less', ['fonts', 'images'], 'html');
});

gulp.task('watch', function() {
	watch(paths.less.watch, function() {
		runSequence('less', 'html');
	});
	watch(paths.js.watch, function() {
		runSequence('js', 'html');
	});
	watch(paths.html.watch, function() {
		gulp.start('html');
	});
	watch(paths.images.watch, function() {
		gulp.start('images');
	});
	watch(paths.fonts.watch, function() {
		gulp.start('fonts');
	});
	watch(paths.node.watch, function() {
		gulp.start('server');
	});
	gulp.start('server');
});

gulp.task('build', function() {
	runSequence('clean', 'supfiles');
});

gulp.task('buildwatch', ['build', 'webserver', 'watch']);

gulp.task('tunnel', function() {
	webserverConfig.tunnel = '220promap';

	gulp.start('server');
	gulp.start('webserver');
})

gulp.task('default', ['build']);
