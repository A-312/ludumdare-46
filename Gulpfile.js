const path = require('path')
const crypto = require('crypto')
const gulp = require('gulp')
const concat = require('gulp-concat')
const postcss = require('gulp-postcss')
const htmlmin = require('gulp-htmlmin')
const less = require('gulp-less')
const ejs = require('gulp-ejs')
const rename = require('gulp-rename')
const sourcemaps = require('gulp-sourcemaps')
const terser = require('gulp-terser-js')
const cssnano = require('cssnano')
const zip = require('gulp-zip')
const YAML = require('yaml')
// const log = require('fancy-log')
// const color = require('ansi-colors')
const del = require('del')
const fs = require('fs')

const $url = require('url')

// Windows support
const normalizeSEP = (str) => str.replace(/\//g, path.sep)

// This files will be copy without change (= no build & noparsing)
const sourceFiles = [
  'design/**',
  '!design/import',
  '!design/import/**',
  '!design/*.less',
  'favicon.png',
  '*.html'
].map(normalizeSEP)

const gameResFiles = [
  'res/**'
]

process.chdir(path.resolve(__dirname))

const buildFolder = path.resolve(__dirname, 'build')
const archiveFolder = path.resolve(__dirname, 'archive')
const mapsFolder = buildFolder // private -> path.resolve(__dirname, 'maps')
const outputBuildFolder = buildFolder

const sourceMapOpt = {
  // sourceMappingURL: (file) => '../' + file.relative.replace(/\\/g, '/') + '.map'
  // sourceMappingURL: (file) => $url.parse($url.resolve(getApp().base_url, file.relative + '.map')).pathname
}

const srcOptions = {
  cwd: path.resolve(__dirname, 'www'),
  base: path.resolve(__dirname, 'www')
}

const terserOptions = {
  mangle: {
    toplevel: true
  }
}

// --

const uuidv4 = () =>
  ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.randomBytes(1)[0] & 15 >> c / 4).toString(16)
  )

const version = uuidv4() // replace by filehash

let app;

function getApp() {
  app = YAML.parse(fs.readFileSync('app.yml', 'utf8'))
  app.build_version = (ejs.build_version === 'auto') ? 'auto' : uuidv4()
  return app
}

const generateEJS = () =>
  gulp.src(watchlist.generateEJS.src, srcOptions)
    .pipe(ejs({
      ...getApp(),
      $url
    }, { async: true }))
    .pipe(rename({ extname: '' })) // .xxx.ejs -> .xxx
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(gulp.dest(outputBuildFolder))


const generateCSS = () =>
  gulp.src(watchlist.generateCSS.src, srcOptions)
    .pipe(sourcemaps.init())
    .pipe(less({
      paths: [
        path.resolve(__dirname, 'www' + path.sep + 'design')
      ]
    })).on('error', printLESSError)
    .pipe(postcss([cssnano]))
    .pipe(sourcemaps.write(path.relative(srcOptions.cwd, mapsFolder), sourceMapOpt))
    .pipe(gulp.dest(outputBuildFolder))

const minifyJS = () =>
  gulp.src(watchlist.minifyJS.src, srcOptions)
    .pipe(sourcemaps.init())
    .pipe(terser(terserOptions)).on('error', function() {
      this.emit('end')
    })
    .pipe(sourcemaps.write(path.relative(srcOptions.cwd, mapsFolder), sourceMapOpt))
    .pipe(gulp.dest(outputBuildFolder))


const srcGameOptions = {
  cwd: path.resolve(__dirname, 'game'),
  base: path.resolve(__dirname, 'game')
}


const minifyGameJS = () =>
  gulp.src(watchlist.minifyGameJS.src, srcGameOptions)
    .pipe(sourcemaps.init())
    .pipe(concat('javascript' + path.sep + 'game.js', { newLine: ';' }))
    .pipe(terser(terserOptions)).on('error', function() {
      this.emit('end')
    })
    .pipe(sourcemaps.write(path.relative(srcOptions.cwd, mapsFolder), sourceMapOpt))
    .pipe(gulp.dest(outputBuildFolder))


const cleanGameRes = () => del([
    path.resolve(buildFolder, 'res')
  ])


const importGameRes = () =>
  gulp.src(gameResFiles, srcGameOptions)
    .pipe(gulp.dest(outputBuildFolder))


const watchlist = {
  generateEJS: {
    src: ['**/*.ejs', '*.ejs'].map(normalizeSEP),
    series: gulp.series(generateEJS)
  },
  editAppSettings: {
    src: normalizeSEP('../app.yml'),
    series: gulp.series(generateEJS)
  },
  generateCSS: {
    src: normalizeSEP('design/**/*.less'),
    series: gulp.series(generateCSS)
  },
  minifyJS: {
    src: ['javascript/index.js'].map(normalizeSEP),
    series: gulp.series(minifyJS)
  },
  minifyGameJS: {
    // ['../../node_modules/phaser/dist/phaser.js', 'javascript/**/*.js']
    // cwd is `<project_pact>/game`
    src: normalizeSEP('javascript/**/*.js'),
    series: gulp.series(minifyGameJS),
    srcOptions: srcGameOptions
  },
  importGameRes: {
    src: gameResFiles,
    series: gulp.series(cleanGameRes, importGameRes),
    srcOptions: srcGameOptions
  }
}

// --

const cleanBuild = () => del([
    buildFolder,
    mapsFolder
  ])


const generateBuild = () =>
  gulp.src(sourceFiles, srcOptions)
    .pipe(gulp.dest(outputBuildFolder))


const archiveSrc = [
  buildFolder + path.sep + '**',
  buildFolder + path.sep + '.htaccess', // because it is hidden file
  mapsFolder + path.sep + '**'
]
const generateArchive = () =>
  gulp.src(archiveSrc, { base: '.' })
    .pipe(zip(`lirelechat_${version}.zip`))
    .pipe(gulp.dest(archiveFolder))


function watch() {
  Object.values(watchlist).forEach((task) => {
    gulp.watch(task.src, task.srcOptions || srcOptions, task.series)
  })
}

gulp.task('clean', cleanBuild)
gulp.task('build', gulp.series(cleanBuild, generateBuild, importGameRes, generateEJS, generateCSS, minifyJS, minifyGameJS))
gulp.task('zip', gulp.series(generateArchive))
gulp.task('watch', gulp.series('build', watch))

/* --------------------------------------- */

function printLESSError(error) {
  terser.printError.call(this, {
    name: error.type,
    line: error.line,
    col: error.column,
    filePath: error.filename,
    fileContent: '' + fs.readFileSync(error.filename),
    message: (error.message || '').replace(error.filename, path.basename(error.filename)).split(' in file')[0],
    plugin: error.plugin
  })
  this.emit('end')
}
