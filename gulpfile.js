//
// Gulp Plugins
//

// Load Gulp
var gulp         = require('gulp');

// Browser Sync
var browserSync  = require('browser-sync').create();
var reload       = browserSync.reload;

// Jade
var jade         = require('gulp-jade');

// Stylus
var stylus       = require('gulp-stylus');
var axis         = require('axis');
var rupture      = require('rupture');     // media queries
var typo         = require('typographic'); // typography
var lost         = require('lost');        // grids

// Post CSS
var autoprefixer = require('gulp-autoprefixer');
var postcss      = require('gulp-postcss');
var sourcemaps   = require('gulp-sourcemaps');

// Catch Errors
var plumber      = require('gulp-plumber');




//
// Source and Destination Files
//

// src files
var src = {
	jade:   ['./src/jade/*.jade', '!./src/jade/layout/**/j*.jade'],
	stylus: './src/stylus/style.styl',
	js: './src/js/*.js'
};


// dest directories
var build = {
	html: 'build/',
	css:  'build/css/',
	js:   'build/js/'
};




//
// Gulp Tasks
//

// Jade >> HTML
gulp.task('jade', function() {
	stream = gulp.src(src.jade)
		.pipe(plumber())
		.pipe(jade({pretty: true}))
		.pipe(gulp.dest(build.html))
		.pipe(reload({stream: true}));

	return stream;
});


// Stylus >> CSS
gulp.task('stylus', function() {
	stream = gulp.src(src.stylus)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(stylus({
			errors: true,
			use: [axis(), rupture(),typo()]
		}))
		.pipe(postcss([
      lost()
    ]))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('./sourcemaps/'))
		.pipe(gulp.dest(build.css))
		.pipe(reload({stream: true}));

	return stream;
});


// Scripts >> JS
gulp.task('js', function() {
	stream = gulp.src(src.js)
		.pipe(plumber())
		.pipe(gulp.dest(build.js))
		.pipe(reload({stream: true}));

	return stream;
})


// Browser Sync
gulp.task( 'default', ['jade', 'stylus', 'js'], function() {

	browserSync.init({
		server: 'build/'
	});

	gulp.watch( src.jade,   ['jade'] );
	gulp.watch( src.stylus, ['stylus'] );
	gulp.watch( src.js,     ['js'] );

});

