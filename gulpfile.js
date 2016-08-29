//
// Gulp Plugins
//

// Load Gulp
var gulp         = require('gulp');

// Jade
var jade         = require('gulp-jade');
var findAffected = require('gulp-jade-find-affected');
var minifyHTML   = require('gulp-minify-html');

// Sitemaps
var sitemap      = require('gulp-sitemap');

// Stylus
var stylus       = require('gulp-stylus');
var axis         = require('axis');
var rupture      = require('rupture');     // media queries
var typo         = require('typographic'); // typography
var lost         = require('lost');        // grids
var minifyCSS    = require('gulp-csso');

// Post CSS
var postcss      = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var sourcemaps   = require('gulp-sourcemaps');
var combineMQ    = require('gulp-combine-mq');
var rucksack     = require('gulp-rucksack');

// Image Compression
var svgo         = require('imagemin-svgo');

// Browser Sync
var browserSync  = require('browser-sync').create();
var reload       = browserSync.reload;

/// Utilities
var plumber      = require('gulp-plumber'); // Catch Errors
var runSequence  = require('run-sequence');

// Compression
var zopfli       = require('gulp-zopfli'); // gzips files
// add the following line to your .htaccess so that
// apache could serve up pre-compressed content:
// Options FollowSymLinks MultiViews

// Deployment
var ftp          = require('vinyl-ftp');



//
// Source and Destination Files
//


// src files
const src = {
	//code assets
	jade:      ['./src/jade/**/*.jade', '!./src/jade/views/**/*.jade'],
	jadeAll:    './src/jade/**/*.jade',
	stylus:     './src/stylus/style.styl',
	stylusAll:  './src/stylus/**/*.styl',
	js:         './src/js/*.js',

	// image assets
	svg:        './src/assets/svg/**/*.svg',
	jpeg:      ['./src/assets/jpg/**/*.jpg', './src/assets/jpg/**/*.jpeg'],
	png:        './src/assets/png/**/*.png'
};


// build directories
const build = {
	html: './build/',
	css:  './build/css/',
	js:   './build/js/',
	img:  './build/img/'
};

// sitemap site url
const siteURL = {
	siteUrl: 'http://www.plumbingflow.com'
};




//
// Gulp Tasks
//


// Jade >> HTML
gulp.task('jade', () => {
	return gulp.src(src.jade)
		.pipe(plumber())
		.pipe(findAffected())
		.pipe(jade({pretty: true}))
		.pipe(gulp.dest(build.html))
		.pipe(reload({stream: true}));
});


// Stylus >> CSS
gulp.task('stylus', () => {
	return gulp.src(src.stylus)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(stylus({
			errors: true,
			use: [axis(), rupture(), typo()]
		}))
		.pipe(rucksack())
		.pipe(postcss([
			lost(),
			autoprefixer({ browsers: ['last 2 versions', '> 5%'] })
		]))
		.pipe(combineMQ({
			beautify: true
		}))
		.pipe(sourcemaps.write('./sourcemaps/'))
		.pipe(gulp.dest(build.css))
		.pipe(reload({stream: true}));
});


// Scripts >> JS
gulp.task('js', () => {
	return gulp.src(src.js)
		.pipe(plumber())
		.pipe(gulp.dest(build.js))
		.pipe(reload({stream: true}));
});


// SVG Pipe
gulp.task('svg', () => {
	return gulp.src(src.svg)
		.pipe(plumber())
		.pipe(gulp.dest(build.img));
});

// JPEG Pipe
gulp.task('jpeg', () => {
	return gulp.src(src.jpeg)
		.pipe(plumber())
		.pipe(gulp.dest(build.img));
});

// PNG Pipe
gulp.task('png', () => {
	return gulp.src(src.png)
		.pipe(plumber())
		.pipe(gulp.dest(build.img));
});


// Browser Sync
gulp.task( 'default', ['jade', 'stylus', 'js', 'svg', 'jpeg', 'png'], () => {

	browserSync.init({
		server: 'build/'
	});

	gulp.watch( src.jadeAll,   [ 'jade'   ]);
	gulp.watch( src.stylusAll, [ 'stylus' ]);
	gulp.watch( src.js,        [ 'js'     ]);
	gulp.watch( src.svg,       [ 'svg'    ]);
	gulp.watch( src.jpeg,      [ 'jpeg'   ]);
	gulp.watch( src.png,       [ 'png'    ]);

});




//
// Production Gulp Tasks
//


// production directories
var pro = {
	html: 'production/',
	css:  'production/css/',
	js:   'production/js/',
	img:  'production/img/'
};


// Jade >> HTML
gulp.task('pro_jade', () => {
	return gulp.src(src.jade)
		.pipe(plumber())
		.pipe(jade())
		.pipe(minifyHTML({
			conditionals: true
		}))
		.pipe(zopfli())
		.pipe(gulp.dest(pro.html));
});


// Stylus >> CSS
gulp.task('pro_stylus', () => {
	return gulp.src(src.stylus)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(stylus({
			errors: true,
			use: [axis(), rupture(),typo()]
		}))
		.pipe(postcss([
			lost(),
			autoprefixer({ browsers: ['last 2 versions', '> 5%'] })
		]))
		.pipe(combineMQ())
		.pipe(minifyCSS({ structureMinimization: true }))
		.pipe(zopfli())
		.pipe(gulp.dest(pro.css));
});


// Scripts >> JS
gulp.task('pro_js', () => {
	return gulp.src(src.js)
		.pipe(plumber())
		.pipe(zopfli())
		.pipe(gulp.dest(pro.js));
});



// SVG Optimization
gulp.task('pro_svg', () => {
	return gulp.src(src.svg)
		.pipe(plumber())
		.pipe(svgo()())
		.pipe(zopfli({ numiterations: 15 }))
		.pipe(gulp.dest(pro.img));
});

// JPEG Optimization
gulp.task('pro_jpeg', () => {
	return gulp.src(src.jpeg)
		.pipe(plumber())
		.pipe(gulp.dest(pro.img));
});

// PNG Optimization
gulp.task('pro_png', () => {
	return gulp.src(src.png)
		.pipe(plumber())
		.pipe(gulp.dest(pro.img));
});

// Sitemap
gulp.task('sitemap', function () {
	gulp.src('./production/**/*.html')
	.pipe(sitemap(siteURL))
	.pipe(gulp.dest(pro.html));
});


// Production Build Task
gulp.task( 'pro', ['pro_jade', 'pro_stylus', 'pro_js', 'pro_svg', 'pro_jpeg', 'pro_png', 'sitemap'], () => {});




// FTP Deploy Task
gulp.task( 'deploy', () => {

var connection = ftp.create( {
} );

var globs = [
	'production/**' // upload everything in the production folder
];

return gulp.src( globs, { base: './production/', buffer: false } )

} );


// Production Build and Deploy
gulp.task( 'pd', () => {
	runSequence( 'pro', 'deploy' );
});
