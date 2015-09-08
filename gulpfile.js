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
var autoprefixer = require('gulp-autoprefixer');
var postcss      = require('gulp-postcss');
var sourcemaps   = require('gulp-sourcemaps');
var combineMQ    = require('gulp-combine-mq');

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
var secrets      = require('./secrets.json'); // password



//
// Source and Destination Files
//

// src files
var src = {
	//code assets
	jade:      ['./src/jade/*.jade', '!./src/jade/layout/**/*.jade'],
	jadeAll:    './src/jade/**/*.jade',
	stylus:     './src/stylus/style.styl',
	stylusAll:  './src/stylus/**/*.styl',
	js:         './src/js/*.js',

	// image assets
	svg:        './src/assets/svg/**/*.svg'
};


// build directories
var build = {
	html: './build/',
	css:  './build/css/',
	js:   './build/js/',
	img:  './build/img/'
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


// SVG Optimization
gulp.task('svg', function() {
	stream = gulp.src(src.svg)	
		.pipe(plumber())
		.pipe(gulp.dest(build.img))

	return stream;
})


// Browser Sync
gulp.task( 'default', ['jade', 'stylus', 'js', 'svg'], function() {

	browserSync.init({
		server: 'build/'
	});

	gulp.watch( src.jadeAll,   [ 'jade'   ]);
	gulp.watch( src.stylusAll, [ 'stylus' ]);
	gulp.watch( src.js,        [ 'js'     ]);
	gulp.watch( src.svg,       [ 'svg'     ]);

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
gulp.task('pro_jade', function() {
	stream = gulp.src(src.jade)
		.pipe(plumber())
		.pipe(jade())
		.pipe(minifyHTML({
			conditionals: true
		}))
		.pipe(zopfli())
		.pipe(gulp.dest(pro.html));

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
	.pipe(minifyCSS({ structureMinimization: true })) 
	.pipe(zopfli())
	.pipe(gulp.dest(pro.css));

	return stream;
});


// Scripts >> JS
gulp.task('pro_js', function() {
	stream = gulp.src(src.js)
		.pipe(plumber())
		.pipe(zopfli())
		.pipe(gulp.dest(pro.js));

	return stream;
})



// SVG Optimization
gulp.task('pro_svg', function() {
	stream = gulp.src(src.svg)	
		.pipe(plumber())
		.pipe(svgo()())
		.pipe(zopfli({ numiterations: 15 }))
		.pipe(gulp.dest(pro.img))

	return stream;
})


// Sitemap
gulp.task('sitemap', function () {
	gulp.src('./production/**/*.html')
	.pipe(sitemap(siteURL))
	.pipe(gulp.dest(pro.html));
});


// Production Build Task
gulp.task( 'pro', ['pro_jade', 'pro_stylus', 'pro_js', 'pro_svg', 'sitemap'], function() {});




// FTP Deploy Task
gulp.task( 'deploy', function() {

var connection = ftp.create( {
	host:     secrets.servers.production.serverhost,
	user:     secrets.servers.production.username,
	password: secrets.servers.production.password,
	parallel: 10
} );

var globs = [
	'production/**' // upload everything in the production folder
];

return gulp.src( globs, { base: './production/', buffer: false } )
	.pipe( connection.newer( secrets.servers.production.remotepath) )   // only upload newer files
	.pipe( connection.dest( secrets.servers.production.remotepath ) );

} );


// Production Build and Deploy
gulp.task( 'pd', function() {
	runSequence( 'pro', 'deploy' )
})
