/*起動コマンド
  $ npx gulp --domain "サイトのドメイン"
//styleguide
  $ npx gulp styleguide
*/
 
//---------------------------------------------------------
//  モード
//---------------------------------------------------------
'use strict'; // 厳格モード

//---------------------------------------------------------
//  本体読み込み
//---------------------------------------------------------
const gulp = require( 'gulp' );
const { src, dest, watch, series, parallel } = require( 'gulp' );
/*
src      =>  参照先指定
dest     =>  出力先指定
watch    =>  ファイル監視
series   =>  直列処理
parallel =>  並列処理
*/

//---------------------------------------------------------
//  入出力パス設定
//---------------------------------------------------------
// 参照元パス
const srcPath = {
  'scss': './production/sass/**/*.scss',
  'php' : './production/php/**/*.php',
  'js'  : './production/js/**/*.js'
}
// 出力先パス
const destPath = {
  'css'  : '../css/',
  'php'  : '../',
  'js'   : '../js/'
}
//styleguide用
const sg_srcPath = {
  'scss' : './src/sass/**/*.scss',
  'js'   : './src/js/**/*.js',
  'watch': './src/**/*'
}
const sg_destPath = {
  'css'  : './htdocs/assets/css/',
  'js'   : './htdocs/assets/js/'
}

//---------------------------------------------------------
//  プラグイン読み込み
//---------------------------------------------------------
const sass         = require( 'gulp-sass' )( require('sass') ); // cssコンパイル
const plumber      = require( 'gulp-plumber' );                 // エラーが発生しても強制終了させない
const notify       = require( 'gulp-notify' );                  // エラー発生時のアラート出力
const postcss      = require( 'gulp-postcss' );                 //Node.js製、CSS操作プラグインのフレームワーク
const autoprefixer = require( 'gulp-autoprefixer' );            // ベンダープレフィックス自動付与(条件はpackage.jsonに記載)
const browserSync  = require( 'browser-sync' );                 // ブラウザシンク
const minimist     = require( 'minimist' );                     // コマンドラインパーサー
const fractal      = require( '@frctl/fractal' ).create();      // fractal

//---------------------------------------------------------
//  fractal設定
//---------------------------------------------------------
// プロジェクト関連のメタデータ設定
fractal.set( 'project.title', 'gulp wordpress styleguide' );
// コンポーネント設定
fractal.components.set( 'path', './src/styleguide/components/' );
// ドキュメントページ設定
fractal.docs.set( 'path', './src/styleguide/docs' );
// 静的ファイルの設定
fractal.web.set( 'static.path', './htdocs/assets' );
// スタイルガイドの出力先
fractal.web.set( 'builder.dest', './styleguide' );
// console表示用
const logger = fractal.cli.console;

//---------------------------------------------------------
//  scssコンパイル
//---------------------------------------------------------
const scssCompile = (done) => {
  return src( srcPath.scss, {
    sourcemaps: true, // init
    })
    // エラーが出ても処理継続
    .pipe( plumber( {
      errorHandler: notify.onError( 'Error:<%= error.message %>' )
    }))
    // CSS形式 => expanded：一般的なCSS形式　compressed：空白、改行取り除く(本番環境用)
    .pipe( sass({ outputStyle: 'expanded' }))
    // ベンダープレフィックス自動付与
    .pipe( autoprefixer())
    // 出力設定
    .pipe( dest( destPath.css, {
      sourcemaps: '/'  // write
    }))
    // 修正部分だけ反映
    .pipe( browserSync.stream()),
    done();
}

//---------------------------------------------------------
//  minimist設定・Browser-sync
//---------------------------------------------------------
const options = minimist( process.argv.slice(2),{ // process.argv=>コマンドラインの引数取得
  string: 'domain',
  default: {
    domain: 'sitedomain.local' // 引数初期値
  }
});
// ローカルサーバー立ち上げ
const browserSyncFunc = (done) => {
  browserSync.init( browserSyncOption );
  done();
}
const browserSyncOption = {
  proxy: {
    target: options.domain
  },
  notify: true
}

//---------------------------------------------------------
//  リロードタスク
//---------------------------------------------------------
const browserSyncReload = (done) => {
  browserSync.reload();
  done();
}

//---------------------------------------------------------
//  PHP・Jsファイル監視、出力
//---------------------------------------------------------
// PHP
const phpWatch = (done) => {
  return src( srcPath.php )
    .pipe( gulp.dest( destPath.php )),
    done();
}
// Js
const jsWatch = (done) => {
  return src( srcPath.js )
    .pipe( gulp.dest( destPath.js )),
    done();
}
// styleguide
const sg_watch = (done) => {
  return src( sg_srcPath.watch ),
  done();
}
// styleguide_Js
const sg_jsWatch = (done) => {
  return src( sg_srcPath.js )
    .pipe( gulp.dest( sg_destPath.js )),
    done();
}
//---------------------------------------------------------
//  styleguide
//---------------------------------------------------------
// styleguideタスク
function styleguideTask() {
  const builder = fractal.web.builder();
  // 出力中のconsole表示設定
  builder.on( 'progress', ( completed, total ) => logger.update( `${total} 件中 ${completed} 件目を出力中...`, 'info'));
  // 出力失敗時のconsole表示設定
  builder.on( 'error', err => logger.error( err.message ));
  //出力処理実行
  return builder.build().then(() => logger.success( 'スタイルガイドの出力処理が完了しました。' ));
}
// sass
const styleguide_scssCompile = (done) => {
  return src( sg_srcPath.scss, {
    sourcemaps: true, // init
    })
    .pipe( plumber({
      errorHandler: notify.onError( 'Error:<%= error.message %>' )
    }))
    .pipe( sass({ outputStyle: 'expanded' }))
    .pipe( autoprefixer())
    .pipe( dest( sg_destPath.css )),
    done();
}
// ローカルサーバー立ち上げ
const sg_browserSyncFunc = (done) => {
  browserSync.init( sg_browserSyncOption );
  done();
}
const sg_browserSyncOption = {
  server: './styleguide/',
  notify: false
}

//---------------------------------------------------------
//  watchタスク
//---------------------------------------------------------
const watchFiles = (done) => {
  watch( srcPath.scss, series( scssCompile ))
  watch( srcPath.php, series( phpWatch, browserSyncReload ))
  watch( srcPath.js, series( jsWatch, browserSyncReload ))
  done();
}
const watchStyleguide = (done) => {
  watch( sg_srcPath.watch, series( styleguide_scssCompile ))
  watch( sg_srcPath.watch, series( sg_watch, styleguideTask ))
  // watch( sg_srcPath.watch, series( sg_watch, browserSyncReload ))
  watch( sg_srcPath.js, series( sg_jsWatch, styleguideTask ))
  done();
}

//---------------------------------------------------------
//  モジュール作成
//---------------------------------------------------------
exports.default = series(
  parallel( phpWatch, jsWatch, scssCompile ),
  parallel( watchFiles, browserSyncFunc )
);

exports.styleguide = series(
  parallel( sg_jsWatch, styleguide_scssCompile, styleguideTask ),
  parallel( watchStyleguide, sg_browserSyncFunc )
);