var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var inject = require('gulp-inject'); //Inject our files
var wiredep = require('wiredep').stream; //To watch for file injections
var browserSync = require('browser-sync').create();
var imagemin = require('gulp-imagemin'); //Optimize our images
var cache = require('gulp-cache'); //Cache optimzed images
var uncss = require('gulp-uncss'); //Remove unnused CSS
var concat = require('gulp-concat');
// var nano = require('gulp-cssnano');
// var bowerFiles = require('main-bower-files');
var es = require('event-stream'); //Allows us to have multiple sources in a gulp task

var config = {
     sassPath: './src/styles',
     bowerDir: './bower_components' 
}

gulp.task('sass', function(){
  var injectAppFiles = gulp.src(['src/styles/scss/*.scss', '!src/styles/scss/_*.scss'], {read: false});

  function transformFilepath(filepath) {
    return '@import "' + filepath + '";';
  }
  var injectAppOptions = {
    transform: transformFilepath,
    starttag: '// inject:app',
    endtag: '// endinject',
    addRootSlash: false
  };

  return gulp.src('src/styles/main.scss')
  .pipe(sourcemaps.init())
    .pipe(wiredep())
    .pipe(autoprefixer())
    //return gulp.src('src/styles/scss/*.scss') //Globbing sass files
    .pipe(inject(injectAppFiles, injectAppOptions))
    .pipe(sass({
      includePaths: ['bower_components/foundation/scss', 'bower_components/font-awesome/font-awesome.scss']
    }))
    // .pipe(concat('main.css'))
        //.pipe(uncss({
          //  html: ['index.html']
      //  }))
        // .pipe(nano())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('src'))
    .pipe(browserSync.stream());
});

gulp.task('wiredep', function () {
  gulp.src('index.html')
    .pipe(wiredep())
    .pipe(gulp.dest(''));
});

gulp.task('fonts', function() { 
    return gulp.src(config.bowerDir + '/font-awesome/scss/**.*') 
        .pipe(gulp.dest('src/styles/scss')); 
});

//Optimize Images
gulp.task('images', function(){
  return gulp.src('src/imgs/*.+(png|jpg|gif|svg)')
  .pipe(cache(imagemin()))
  .pipe(gulp.dest('src/imgs'))
});

gulp.task('js', function(){
  //This copies the file and places it on our directory
  // return gulp.src(config.bowerDir + '/foundation/js/foundation.js', config.bowerDir + '/foundation/js/vendor/modernizr.js') 
  //     .pipe(gulp.dest('src/js')); 
  return es.concat(
    gulp.src(config.bowerDir + '/foundation/js/foundation.js')
      .pipe(gulp.dest('src/js')),
    gulp.src(config.bowerDir + '/foundation/js/vendor/modernizr.js')
        .pipe(gulp.dest('src/js')),
    gulp.src(config.bowerDir + '/jquery/dist/jquery.js')
      .pipe(gulp.dest('src/js')),
    gulp.src(config.bowerDir + '/foundation/js/vendor/fastclick.js')
      .pipe(gulp.dest('src/js'))
  );
});



gulp.task('inject', ['sass'], function(){
  var sources = gulp.src(['src/main.css', 'src/main.js'], {read: false});
  var target = gulp.src('index.html');

  //Remove the leading slash
  var injectOptions = {
    addRootSlash: false,
    // ignorePath: ['src', 'dist']
  };

  return target.pipe(inject(sources, injectOptions))
  .pipe(gulp.dest(''))
});

// Static Server + watching scss/html files
gulp.task('serve', ['inject'], function() {
    browserSync.init({
        //proxy: "index.html"
        server: {
            baseDir: "./"
            // baseDir: "dist"
        }
    });

    gulp.watch('src/styles/scss/*.scss', ['sass']);
    gulp.watch('src/js/main.js', ['js']);
    gulp.watch('index.html', ['sass']);
    gulp.watch("*.html").on('change', browserSync.reload);
});


// Default Task
gulp.task('default', ['serve']);

gulp.task('optimize', ['images']);
