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
var findAffected = require('gulp-jade-find-affected');
var minifyHTML   = require('gulp-minify-html');

// Stylus
var stylus       = require('gulp-stylus');
var axis         = require('axis');
var rupture      = require('rupture');     // media queries
var typo         = require('typographic'); // typography
var lost         = require('lost');        // grids
var minifyCSS    = require('gulp-csso');

// Post CSS
var autoprefixer = require('gulp-autoprefixer');
var postcss      = require('gulp-postcss');
var sourcemaps   = require('gulp-sourcemaps');
var combineMQ    = require('gulp-combine-mq');

// Catch Errors
var plumber      = require('gulp-plumber');

// Sitemaps
var sitemap      = require('gulp-sitemap');




//
// Source and Destination Files
//

// src files
var src = {
	jade:      ['./src/jade/*.jade', '!./src/jade/layout/**/*.jade'],
	jadeAll:    './src/jade/**/*.jade',
	stylus:     './src/stylus/style.styl',
	stylusAll:  './src/stylus/**/*.styl',
	js:         './src/js/*.js'
};


// build directories
var build = {
	html: './build/',
	css:  './build/css/',
	js:   './build/js/'
};

// sitemap site url
var siteURL = {
	siteUrl: 'http://www.plumbingflow.com'
}




//
// Gulp Tasks
//

// Jade >> HTML
gulp.task('jade', function() {
	stream = gulp.src(src.jade)
		.pipe(plumber())
		.pipe(findAffected())
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
    .pipe(combineMQ({
        beautify: true
    }))
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
});


// Browser Sync
gulp.task( 'default', ['jade', 'stylus', 'js'], function() {

	browserSync.init({
		server: 'build/'
	});

	gulp.watch( src.jadeAll,   [ 'jade'   ]);
	gulp.watch( src.stylusAll, [ 'stylus' ]);
	gulp.watch( src.js,        [ 'js'     ]);

});




//
// Production Gulp Tasks
//

// production directories
var pro = {
	html: 'production/',
	css:  'production/css/',
	js:   'production/js/'
};


// Jade >> HTML
gulp.task('pro_jade', function() {
	stream = gulp.src(src.jade)
		.pipe(plumber())
		.pipe(jade())
		.pipe(minifyHTML({
			conditionals: true
		}))
		.pipe(gulp.dest(pro.html))
		.pipe(reload({stream: true}));

	return stream;
});


// Stylus >> CSS
gulp.task('pro_stylus', function() {
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
    .pipe(combineMQ())
    .pipe(autoprefixer())
    .pipe(minifyCSS({
    	structureMinimization: true
  	}))
		.pipe(gulp.dest(pro.css))
		.pipe(reload({stream: true}));

	return stream;
});


// Scripts >> JS
gulp.task('pro_js', function() {
	stream = gulp.src(src.js)
		.pipe(plumber())
		.pipe(gulp.dest(pro.js))
		.pipe(reload({stream: true}));

	return stream;
})


// Sitemap
gulp.task('sitemap', function () {
  gulp.src('./production/**/*.html')
    .pipe(sitemap(siteURL))
    .pipe(gulp.dest('./production'));
});


// Production Build Task
gulp.task( 'pro', ['pro_jade', 'pro_stylus', 'pro_js', 'sitemap'], function() {});
