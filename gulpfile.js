'use strict';
var gulp = require('gulp'),
sass = require('gulp-sass'),
changed = require('gulp-changed'),
cached = require('gulp-cached'),
gulpif = require('gulp-if'),
filter = require('gulp-filter'),
autoprefixer = require('gulp-autoprefixer'),
server = require('gulp-server-livereload'),
cleanCSS = require('gulp-clean-css'),
path = require('path'),
wiredep = require('wiredep').stream,
useref = require('gulp-useref'),
uglify = require('gulp-uglify'),
imagemin = require('gulp-imagemin'),
del = require('del'),
htmlmin = require('gulp-htmlmin'),
realFavicon = require ('gulp-real-favicon'),
fs = require('fs'),
FAVICON_DATA_FILE = 'faviconData.json',
uglify = require('gulp-uglify'),
pump = require('pump');


/*
---------------

Work tasks

----------------
*/


//Server-livereload

gulp.task('server', function() {
	gulp.src('app')
	.pipe(server({
		livereload: true,
		defaultFile: 'index.html',
		open: true
		}));
	});

// Sass compiler

gulp.task('sass', function () {
	return gulp.src(['app/sass/**/*.sass', 'app/sass/**/*.scss'])
	.pipe(sass({outputStyle: 'expanded', includePaths: require('node-bourbon').includePaths}).on('error', sass.logError))
	.pipe(autoprefixer({
		browsers: ['last 15 versions', '> 1%', 'ie 8', 'ie 7'],
		cascade: false
		}))
	.pipe(gulp.dest('app/css'));
	});


//Sass Wathing functions

gulp.task('setWatch', function() {
	global.isWatching = true;
	});



//Bower
gulp.task('bower', function () {
	gulp.src('app/*.html')
	.pipe(wiredep({
		directory: 'app/bower_components'
		}))
	.pipe(gulp.dest('app'));
	});


//Watch
gulp.task('watch', function() {
	gulp.watch('app/sass/**/*.+(scss|sass)', ['sass']);

	});


//Work
gulp.task('work', ['server', 'watch']);


//Clean old favicons

gulp.task('clean-favicons', function(){
	return del.sync('app/favicons/*')

	});


//Favicons 
//Task make in http://realfavicongenerator.net/

//1. For generation favicons add main_favicon.png and start favicon-generate
//2. Make img/short_favicon.ico Shortcut icon 16 24 32 48 64 in http://realfavicongenerator.net/

//Make Favicon
gulp.task('favicon-generate', function(done) {
	realFavicon.generateFavicon({
		masterPicture: 'app/img/main-favicon.png',
		dest: 'app/favicons',
		iconsPath: 'favicons',
		design: {
			ios: {
				pictureAspect: 'noChange',
				assets: {
					ios6AndPriorIcons: true,
					ios7AndLaterIcons: true,
					precomposedIcons: true,
					declareOnlyDefaultIcon: true
				}
				},
				desktopBrowser: {},
				windows: {
					pictureAspect: 'noChange',
				backgroundColor: '#fa5c65', // App color
				onConflict: 'override',
				assets: {
					windows80Ie10Tile: true,
					windows10Ie11EdgeTiles: {
						small: true,
						medium: true,
						big: true,
						rectangle: false
					}
				}
				},
				androidChrome: {
					pictureAspect: 'noChange',
					themeColor: '#ffffff',
					manifest: {
					name: 'Freelancers web studio', // App name
					display: 'standalone',
					orientation: 'notSet',
					onConflict: 'override',
					declared: true
					},
					assets: {
						legacyIcon: false,
						lowResolutionIcons: false
					}
					},
					safariPinnedTab: {
						pictureAspect: 'silhouette',
				themeColor: '#fa5c65' // App color
			}
			},
			settings: {
				scalingAlgorithm: 'Mitchell',
				errorOnImageTooSmall: false
				},
				markupFile: FAVICON_DATA_FILE
				}, function() {
					done();
					});
	});

//Warning use!!!

//Add html code for favicon
gulp.task('favicon-html', function() {
	gulp.src([ 'app/*.html' ])
	.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
	.pipe(gulp.dest('app'));
	});

gulp.task('check-for-favicon-update', function(done) {
	var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
	realFavicon.checkForUpdates(currentVersion, function(err) {
		if (err) {
			throw err;
		}
		});
	});



/*
---------------

Build tasks

With compressed: css, html and js files.

----------------
*/



//Clean bild

gulp.task('clean-build', function(){
	return del.sync('build/**/*')

	});

// Sass compressed build

gulp.task('sass-compressed', function () {
	return gulp.src(['app/sass/**/*.sass', 'app/sass/**/*.scss'])
	.pipe(sass({outputStyle: 'compressed', includePaths: require('node-bourbon').includePaths}).on('error', sass.logError))
	.pipe(autoprefixer({
		browsers: ['last 15 versions', '> 1%', 'ie 8', 'ie 7'],
		cascade: false
		}))
	.pipe(gulp.dest('build/css'));
	});



//Images
gulp.task('images-min', function(){
	return gulp.src('app/img/**/*')
	.pipe(imagemin({
		progressive: true,
		optimizationLevel: 7
		}))
	.pipe(gulp.dest('build/img'));
	});


//Custom Js files compression



//Build 

gulp.task('build', ['clean-build','images-min','sass-compressed'], function () {
	gulp.src(['app/fonts/**/*'])
	.pipe(gulp.dest('build/fonts'));

	gulp.src(['app/libs/**/*'])
	.pipe(gulp.dest('build/libs'));

	gulp.src(['app/favicons/**/*'])
	.pipe(gulp.dest('build/favicons'));

	gulp.src(['app/*.php', 'app/.htaccess', 'app/htaccess.txt', 'app/robots.txt', 'app/sitemap.xml'])
	.pipe(gulp.dest('build'));

	gulp.src('app/*.html')
	.pipe(gulp.dest('build'));

	gulp.src('app/js/**/*.js')
	.pipe(uglify())
	.pipe(gulp.dest('build/js'));

	gulp.src('app/libs/**/*.js')
	.pipe(uglify())
	.pipe(gulp.dest('build/libs'));

	});


/*
---------------

Production tasks (Experimental!)

Concat js and css in one files

----------------
*/

//Clean bild

gulp.task('clean-prod', function(){
	return del.sync('prod/**/*')

	});


// Concat files

gulp.task('filesconcat', function () {
	return gulp.src('build/*.html')
	.pipe(useref())
	.pipe(gulp.dest('prod'));
	});


//Production 

gulp.task('production', ['clean-prod','filesconcat'], function () {
	gulp.src(['build/fonts/**/*'])
	.pipe(gulp.dest('prod/fonts'));

	gulp.src(['build/favicons/**/*'])
	.pipe(gulp.dest('prod/favicons'));

	gulp.src(['build/*.php', 'build/.htaccess', 'build/htaccess.txt', 'build/robots.txt', 'build/sitemap.xml'])
	.pipe(gulp.dest('prod'));

	gulp.src(['prod/*.html'])
	.pipe(htmlmin({collapseWhitespace: true, processConditionalComments: true}))
	.pipe(gulp.dest('prod'));

	});