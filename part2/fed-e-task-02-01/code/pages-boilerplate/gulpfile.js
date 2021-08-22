// 实现这个项目的构建任务
const { src, dest, series, parallel, watch } = require('gulp')
const loadPlugins = require('gulp-load-plugins')
const plugins = loadPlugins()
const browserSync = require('browser-sync')
const bs = browserSync.create()
const del = require('del')

const data = {
  menus: [
    {
      name: 'Home',
      icon: 'aperture',
      link: 'index.html'
    },
    {
      name: 'Features',
      link: 'features.html'
    },
    {
      name: 'About',
      link: 'about.html'
    },
    {
      name: 'Contact',
      link: '#',
      children: [
        {
          name: 'Twitter',
          link: 'https://twitter.com/w_zce'
        },
        {
          name: 'About',
          link: 'https://weibo.com/zceme'
        },
        {
          name: 'divider'
        },
        {
          name: 'About',
          link: 'https://github.com/zce'
        }
      ]
    }
  ],
  pkg: require('./package.json'),
  date: new Date(),

}

const page = () => {
  return src('src/**/*.html', { base: 'src' })
    .pipe(plugins.swig({ data, defaults:{cache: false}}))
    .pipe(dest('.temp'))
}

const style = () => {
  return src('src/assets/styles/*.scss', { base: 'src' })
    .pipe(plugins.sass({ outPutStyle: 'expand' }))
    .pipe(dest('.temp'))
}

const script = () => {
  return src('src/assets/scripts/*.js', { base: 'src' })
    .pipe(plugins.babel({ presets: ['@babel/preset-env'] }))
    .pipe(dest('.temp'))
}

const image = () => {
  return src('src/assets/images/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

const font = () => {
  return src('src/assets/fonts/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

const extra = () => {
  return src('public/**', { base: 'public' })
    .pipe(dest('dist'))
}

const clean = () => {
  return del(['dist', '.temp'])
}

const useref = () => {
  return src('.temp/**/*.html', { base: '.temp' })
    .pipe(plugins.useref({ searchPath: ['.temp', '.'] }))
    .pipe(plugins.if(/.js$/, plugins.uglify()))
    .pipe(plugins.if(/.css$/, plugins.cleanCss()))
    .pipe(plugins.if(/.html$/, plugins.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true
    })))
    .pipe(dest('dist'))
}

const develop = () => {
  watch('src/**/*.html', page)
  watch('src/assets/styles/**.scss', style)
  watch('src/assets/scripts/**.js', script)
  watch([
    'src/assets/images/**',
    'src/assets/fonts/**',
    'public/**'
  ], bs.reload())

  const argv = process.argv
  console.log(argv)
  const ind = argv.indexOf('--port')

  bs.init({
    notify: false,
    port: ind > 0 ? argv[ ind + 1 ]: 2080,
    open: argv.includes('--open'),
    files: '.temp/**', // 监听 tmp 下的目录，一旦发生变化，自动刷新页面
    server: {
      baseDir: ['.temp', 'src', 'public'], // 静态文件存放的基础路径
      routes: {
        '/node_modules': './node_modules'
      }
    }
  })
}

const production = () => {

  const argv = process.argv
  const ind = argv.indexOf('--port')

  bs.init({
    notify: false,
    port: ind > 0 ? argv[ ind + 1 ]: 2080,
    open: argv.includes('--open'),
    server: {
      baseDir: ['dist'], // 静态文件存放的基础路径
    }
  })
}

const jsLint = () => {
  return src('src/assets/scripts/*.js')
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('default'))
}

const styleLint = () => {
  return src('src/assets/styles/*.scss')
    .pipe(plugins.scssLint())
}


const compile = parallel(page, style, script)

const build = series(clean, parallel(series(compile, useref), image, font, extra))

const serve = series(clean, compile, develop)

const start = series(build, production)

const lint = parallel(jsLint, styleLint)

module.exports = {
  serve,
  build,
  clean,
  start,
  lint
}